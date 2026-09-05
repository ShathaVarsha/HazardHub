"""
Comprehensive Verification Script for HazardHub AI
Verifies all 4 engines, storage state, agent tool routing, and manifest generation in pure Python.
"""

import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from storage.state import StateManager
from engines.chemiguard import ChemiGuardEngine
from engines.quotapacker import QuotaPackerEngine, AutoBundleOptions
from engines.resilienceguard import ResilienceGuardEngine
from engines.custodysentinel import QRPayloadGenerator
from agent.agent import AIOperationsAgent
from components.manifest import render_epa_manifest_html


def test_full_suite():
    print("=" * 70)
    print("  HAZARDHUB AI - COMPREHENSIVE END-TO-END VERIFICATION SUITE")
    print("=" * 70)

    # 1. State Manager & Seed Data
    print("\n[STEP 1] Testing StateManager and Seeded Data...")
    state = StateManager()
    state.reset_to_defaults()
    assert len(state.labs) == 8, f"Expected 8 labs, got {len(state.labs)}"
    assert len(state.waste_items) == 30, f"Expected 30 waste items, got {len(state.waste_items)}"
    assert state.network_mode == "ONLINE", f"Expected ONLINE, got {state.network_mode}"
    print(f"  [OK] 8 Labs and 30 Waste Items loaded successfully. Network: {state.network_mode}")

    # 2. ChemiGuard EPA 40 CFR Part 264 App V Engine
    print("\n[STEP 2] Testing ChemiGuard Compatibility Engine...")
    nitric = next(w for w in state.waste_items if "nitric acid" in w.name.lower())
    acetone = next(w for w in state.waste_items if "acetone" in w.name.lower() or "solvent" in w.name.lower())
    bleach = next(w for w in state.waste_items if "bleach" in w.name.lower())
    ammonia = next(w for w in state.waste_items if "ammonia" in w.name.lower())
    cyanide = next(w for w in state.waste_items if "cyanide" in w.name.lower())
    hcl = next(w for w in state.waste_items if "hydrochloric" in w.name.lower())
    ethanol = next(w for w in state.waste_items if "ethanol" in w.name.lower())

    # Nitric + Acetone -> EXPLOSION
    res1 = ChemiGuardEngine.check_pair(nitric, acetone)
    assert res1 is not None and res1.consequence == "EXPLOSION"
    print(f"  [OK] Nitric Acid + Acetone correctly BLOCKED with {res1.consequence}")

    # Bleach + Ammonia -> TOXIC_GAS
    res2 = ChemiGuardEngine.check_pair(bleach, ammonia)
    assert res2 is not None and res2.consequence == "TOXIC_GAS"
    print(f"  [OK] Bleach + Ammonia correctly BLOCKED with {res2.consequence}")

    # Acid + Cyanide -> TOXIC_GAS
    res3 = ChemiGuardEngine.check_pair(hcl, cyanide)
    assert res3 is not None and res3.consequence == "TOXIC_GAS"
    print(f"  [OK] Acid + Cyanide correctly BLOCKED with {res3.consequence}")

    # Acetone + Ethanol -> SAFE
    res4 = ChemiGuardEngine.check_pair(acetone, ethanol)
    assert res4 is None
    print(f"  [OK] Acetone + Ethanol correctly evaluated as 100% EPA SAFE")

    # Safe substitution & splitting
    subs = ChemiGuardEngine.find_safe_substitutes(nitric, [acetone, ethanol], state.waste_items)
    assert len(subs) > 0
    print(f"  [OK] ChemiGuard found {len(subs)} safe substitute containers for incompatible lot")

    # 3. QuotaPacker Knapsack Pooling Engine
    print("\n[STEP 3] Testing QuotaPacker Knapsack Pooling Engine...")
    bundle = QuotaPackerEngine.auto_bundle(state.waste_items, AutoBundleOptions(
        min_threshold_liters=150.0,
        reserve_buffer_percent=15.0,
    ))
    assert bundle.is_threshold_met, "QuotaPacker failed to meet 150L threshold"
    assert bundle.total_volume_liters >= 150.0, f"Volume {bundle.total_volume_liters} < 150"
    assert bundle.compatibility.is_safe, "QuotaPacker selected incompatible waste items"
    print(f"  [OK] Auto-Bundle assembled {bundle.total_volume_liters:.1f} L across {len(bundle.participating_lab_ids)} labs")
    print(f"  [OK] Reserve safety buffer: +{bundle.reserve_buffer_liters:.1f} L (Target: 172.5L)")
    print(f"  [OK] Standby reserve containers identified: {len(bundle.standby_reserve_items)}")

    # Create formal lot record
    lot = state.create_pickup_lot(bundle)
    assert len(state.pickup_lots) == 1
    assert lot.status == "SCHEDULED"
    print(f"  [OK] Staged Lot {lot.lot_number} ({lot.total_volume_liters:.1f}L)")

    # 4. ResilienceGuard Disruption Recovery
    print("\n[STEP 4] Testing ResilienceGuard Self-Healing Engine...")
    rej_item_id = lot.waste_item_ids[0]
    rej_item = next(w for w in state.waste_items if w.id == rej_item_id)
    recovery_plan = state.handle_canister_rejection(lot.id, rej_item_id, "DAMAGED_LEAKING")
    assert recovery_plan is not None
    assert recovery_plan.can_be_fully_restored
    assert lot.total_volume_liters >= 150.0, "Lot dropped below threshold after recovery"
    assert len(state.disruption_logs) == 1
    print(f"  [OK] Canister rejection resolved: {recovery_plan.explanation}")
    print(f"  [OK] Lot volume maintained at {lot.total_volume_liters:.1f} L (>= 150L quota)")

    # 5. CustodySentinel Cryptographic Chain of Custody & QR Codes
    print("\n[STEP 5] Testing CustodySentinel & Offline QR Code...")
    sig_hash = "DR-ELEANOR-VANCE-AUTH-0901"
    qr_payload_str = QRPayloadGenerator.create_payload_string(lot, sig_hash)
    parsed = QRPayloadGenerator.parse_payload_string(qr_payload_str)
    assert parsed is not None
    assert parsed["manifestChecksum"].startswith("SHA256-")
    assert parsed["technicianSignatureHash"] == sig_hash

    # Generate QR Code image
    qr_img_data_url = QRPayloadGenerator.render_qr_code_data_url(qr_payload_str)
    assert qr_img_data_url.startswith("data:image/png;base64,")
    assert len(qr_img_data_url) > 100
    print(f"  [OK] Cryptographic SHA-256 Checksum: {parsed['manifestChecksum']}")
    print(f"  [OK] Offline QR Code rendered: PNG Base64 Data URL ({len(qr_img_data_url)} chars)")

    # 6. EPA Form 8700-22 Manifest HTML Generator
    print("\n[STEP 6] Testing EPA Form 8700-22 Manifest...")
    lot_items = state.get_waste_by_ids(lot.waste_item_ids)
    manifest_html = render_epa_manifest_html(lot, lot_items, state.labs)
    assert "UNIFORM HAZARDOUS WASTE MANIFEST" in manifest_html
    assert "EPA Form 8700-22" in manifest_html
    assert lot.lot_number in manifest_html
    assert "CONSOLIDATED CO-OP TOTAL VOLUME" in manifest_html
    print(f"  [OK] Official Uniform Manifest rendered successfully ({len(manifest_html)} bytes HTML)")

    # 7. AI Operations Agent Tool Calling
    print("\n[STEP 7] Testing AI Operations Agent Tool Invocations...")
    # Intent 1: Pooling
    m1 = AIOperationsAgent.process_query("Can we bundle a pickup lot?", state)
    assert len(m1.tool_calls) == 1
    assert m1.tool_calls[0].tool_name == "proposeOptimalLot"
    print(f"  [OK] Intent 'bundle pickup lot' invoked tool: {m1.tool_calls[0].tool_name}")

    # Intent 2: Urgency
    m2 = AIOperationsAgent.process_query("What is urgent or expiring?", state)
    assert len(m2.tool_calls) == 1
    assert m2.tool_calls[0].tool_name == "inspectUrgentWaste"
    print(f"  [OK] Intent 'urgent / expiring' invoked tool: {m2.tool_calls[0].tool_name}")

    # Intent 3: Safety Block
    m3 = AIOperationsAgent.process_query("Is Nitric Acid safe with Acetone?", state)
    assert "CRITICAL SAFETY WARNING" in m3.content or "EXPLOSION" in m3.content
    print(f"  [OK] Intent 'Nitric Acid + Acetone' provided critical explosion warning")

    # Intent 4: Readiness
    m4 = AIOperationsAgent.process_query("Cooperative Readiness Overview", state)
    assert len(m4.tool_calls) == 1
    assert m4.tool_calls[0].tool_name == "queryReadiness"
    print(f"  [OK] Intent 'readiness overview' invoked tool: {m4.tool_calls[0].tool_name}")

    # Reset state cleanly
    state.reset_to_defaults()

    print("\n" + "=" * 70)
    print("  ALL 7 VERIFICATION STAGES PASSED WITH 100% SUCCESS!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    success = test_full_suite()
    sys.exit(0 if success else 1)
