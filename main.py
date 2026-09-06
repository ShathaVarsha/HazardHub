import sys
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import dataclasses

from storage.state import get_state
from engines.quotapacker import QuotaPackerEngine, AutoBundleOptions
from engines.resilienceguard import ResilienceGuardEngine
from agent.agent import AIOperationsAgent

app = FastAPI(title="HazardHub AI REST API")

# Enable CORS for the React frontend (running on Vite's port 5173 or others)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state = get_state()

# ──────────────────────────────────────────
# Request / Response Models
# ──────────────────────────────────────────

class CancelLabRequest(BaseModel):
    lab_id: str

class RejectItemRequest(BaseModel):
    pickup_lot_id: str
    waste_item_id: str
    reason: str

class ChatRequest(BaseModel):
    message: str

class PairTestRequest(BaseModel):
    item_a_id: str
    item_b_id: str

# ──────────────────────────────────────────
# Endpoints & Adapters
# ──────────────────────────────────────────

def adapt_lab(lab):
    return {
        "id": lab.id,
        "code": "L-" + lab.id[-2:],
        "name": lab.name,
        "facilityType": lab.type,
        "address": lab.address,
        "city": "Seattle",
        "state": "WA",
        "epaId": lab.epa_facility_id,
        "contactName": lab.contact_person,
        "contactEmail": "contact@example.com",
        "contactPhone": lab.phone,
        "dockType": "Standard Dock",
        "operationalStatus": "active" if lab.is_participating else "cancelled",
        "activeDrumCount": sum(1 for w in state.waste_items if w.lab_id == lab.id and w.status == "AVAILABLE"),
        "totalVolumeLiters": sum(w.volume_liters for w in state.waste_items if w.lab_id == lab.id),
        "safetyAuditScore": 95,
        "lastInspectionDate": "2026-09-01",
        "specialHandlingNotes": lab.storage_location
    }

def adapt_waste(w):
    return {
        "id": w.id,
        "trackingId": "TRK-" + w.id,
        "labId": w.lab_id,
        "labName": next((l.name for l in state.labs if l.id == w.lab_id), "Unknown"),
        "chemicalName": w.name,
        "commonName": w.chemical_formula or "Chemical Waste",
        "casNumber": "00-00-0",
        "hazardClass": w.epa_group.replace("_", " ").title(),
        "epaWasteCode": "D001",
        "dotProperShippingName": w.dot_class,
        "unNumber": w.un_code,
        "containerType": "55-gal Poly Drum",
        "volumeLiters": w.volume_liters,
        "weightLbs": w.volume_liters * 2.2,
        "urgency": w.urgency.lower(),
        "status": "queued" if w.status == "IN_LOT" else "available",
        "storageBay": "Main Bay",
        "dateLogged": w.expiration_date,
        "notes": w.notes
    }

def adapt_lot(lot):
    return {
        "id": lot.id,
        "runCode": lot.lot_number,
        "scheduledDate": lot.scheduled_date,
        "haulerName": lot.hauler_name,
        "haulerVehicleId": lot.hauler_truck_plate,
        "driverName": lot.hauler_driver_name,
        "vehicleCapacityLiters": 1892.7,
        "currentVolumeLiters": lot.total_volume_liters,
        "currentWeightLbs": lot.total_volume_liters * 2.2,
        "utilizationPercent": (lot.total_volume_liters / lot.target_threshold_liters) * 100,
        "status": "scheduled",
        "items": [adapt_waste(next((w for w in state.waste_items if w.id == wid), None)) for wid in lot.waste_item_ids if next((w for w in state.waste_items if w.id == wid), None)],
        "stops": [],
        "chemiGuardVerified": True,
        "verificationHash": "Verified_SHA256",
        "manifestNumber": "MANIFEST-01",
        "tsdfFacility": "Regional Disposal"
    }

@app.get("/api/state")
def get_current_state():
    return {
        "labs": [adapt_lab(l) for l in state.labs],
        "wasteItems": [adapt_waste(w) for w in state.waste_items],
        "pickupLots": [adapt_lot(lot) for lot in state.pickup_lots],
        "networkMode": state.network_mode,
        "disruptionLogs": state.disruption_logs,
    }

@app.post("/api/autobundle")
def auto_bundle_waste():
    try:
        # Run QuotaPacker knapsack optimizer
        bundle = QuotaPackerEngine.auto_bundle(state.waste_items, AutoBundleOptions(
            min_threshold_liters=150.0,
            reserve_buffer_percent=15.0,
        ))
        
        # Convert bundle to an active lot in state
        if bundle.participating_lab_ids:
            new_lot = state.create_pickup_lot(bundle)
            return {"status": "success", "lot": new_lot, "message": f"Successfully created pickup lot totaling {bundle.total_volume_liters:.1f}L"}
        else:
            return {"status": "warning", "message": "No compatible waste available to meet the 150L quota."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/failover")
def cancel_lab(req: CancelLabRequest):
    try:
        recovery_plan = state.handle_lab_cancellation(req.lab_id)
        return {"status": "success", "recovery": dataclasses.asdict(recovery_plan) if recovery_plan else None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/reject")
def reject_container(req: RejectItemRequest):
    try:
        recovery_plan = state.handle_canister_rejection(req.pickup_lot_id, req.waste_item_id, req.reason)
        return {"status": "success", "recovery": dataclasses.asdict(recovery_plan) if recovery_plan else None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    try:
        response = AIOperationsAgent.process_query(req.message, state)
        return {"status": "success", "message": response.content, "tool_calls": [tc.model_dump() for tc in response.tool_calls]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/chemiguard/test")
def test_chemical_pair(req: PairTestRequest):
    item_a = next((w for w in state.waste_items if w.id == req.item_a_id), None)
    item_b = next((w for w in state.waste_items if w.id == req.item_b_id), None)
    if not item_a or not item_b:
        raise HTTPException(status_code=404, detail="Waste item not found")
        
    from engines.chemiguard import ChemiGuardEngine
    issue = ChemiGuardEngine.check_pair(item_a, item_b)
    
    if issue is None:
        return {"isCompatible": True, "violation": None}
    else:
        return {
            "isCompatible": False, 
            "violation": {
                "reason": issue.hazard_description,
                "reactionConsequence": issue.consequence,
                "epaCitation": "EPA 40 CFR 264.177",
                "dotCitation": "DOT 49 CFR 177.848"
            }
        }

@app.post("/api/reset")
def reset_database():
    state.reset_to_defaults()
    return {"status": "success", "message": "Database reset to 8 facilities and 30 items."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
