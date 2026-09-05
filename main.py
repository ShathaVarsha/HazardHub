import sys
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

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

# ──────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────

@app.get("/api/state")
def get_current_state():
    return {
        "labs": state.labs,
        "wasteItems": state.waste_items,
        "pickupLots": state.pickup_lots,
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
        return {"status": "success", "recovery": recovery_plan.model_dump() if recovery_plan else None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/reject")
def reject_container(req: RejectItemRequest):
    try:
        recovery_plan = state.handle_canister_rejection(req.pickup_lot_id, req.waste_item_id, req.reason)
        return {"status": "success", "recovery": recovery_plan.model_dump() if recovery_plan else None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    try:
        response = AIOperationsAgent.process_query(req.message, state)
        return {"status": "success", "message": response.content, "tool_calls": [tc.model_dump() for tc in response.tool_calls]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/reset")
def reset_database():
    state.reset_to_defaults()
    return {"status": "success", "message": "Database reset to 8 facilities and 30 items."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
