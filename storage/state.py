"""
HazardHub Local-First State Manager
Pure Python equivalent to src/storage/db.ts
Provides persistent JSON storage and session state management with reactive updates.
"""

import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any

from models import (
    Lab, WasteItem, PickupLot, CustodyEvent, DisruptionLog,
    NetworkMode, ProposedLotBundle, RecoveryPlan
)
from data.labs import SEEDED_LABS
from data.waste import SEEDED_WASTE_ITEMS
from engines.quotapacker import QuotaPackerEngine
from engines.resilienceguard import ResilienceGuardEngine

STATE_FILE = os.path.join(os.path.dirname(__file__), 'hazardhub_state.json')


class StateManager:
    """
    Local-first persistence manager for HazardHub AI.
    """

    def __init__(self, persistence_file: str = STATE_FILE):
        self.persistence_file = persistence_file
        self.labs: List[Lab] = []
        self.waste_items: List[WasteItem] = []
        self.pickup_lots: List[PickupLot] = []
        self.custody_events: List[CustodyEvent] = []
        self.disruption_logs: List[DisruptionLog] = []
        self.network_mode: NetworkMode = 'ONLINE'
        self.load_or_seed()

    def reset_to_defaults(self):
        """Resets all data to initial seeded state."""
        self.labs = [Lab.from_dict(lab.to_dict()) for lab in SEEDED_LABS]
        self.waste_items = [WasteItem.from_dict(item.to_dict()) for item in SEEDED_WASTE_ITEMS]
        self.pickup_lots = []
        self.custody_events = []
        self.disruption_logs = []
        self.network_mode = 'ONLINE'
        self.save()

    def load_or_seed(self):
        """Loads persisted state from file or seeds initial state."""
        if os.path.exists(self.persistence_file):
            try:
                with open(self.persistence_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.labs = [Lab.from_dict(d) for d in data.get('labs', [])]
                self.waste_items = [WasteItem.from_dict(d) for d in data.get('waste_items', [])]
                self.pickup_lots = [PickupLot.from_dict(d) for d in data.get('pickup_lots', [])]
                self.custody_events = [CustodyEvent.from_dict(d) for d in data.get('custody_events', [])]
                self.disruption_logs = [DisruptionLog.from_dict(d) for d in data.get('disruption_logs', [])]
                self.network_mode = data.get('network_mode', 'ONLINE')
                if not self.labs or not self.waste_items:
                    self.reset_to_defaults()
                return
            except Exception as e:
                print(f"Warning: Failed to load state from {self.persistence_file}: {e}")
        self.reset_to_defaults()

    def save(self):
        """Serializes and saves state to local JSON file."""
        try:
            data = {
                'labs': [l.to_dict() for l in self.labs],
                'waste_items': [w.to_dict() for w in self.waste_items],
                'pickup_lots': [p.to_dict() for p in self.pickup_lots],
                'custody_events': [c.to_dict() for c in self.custody_events],
                'disruption_logs': [d.to_dict() for d in self.disruption_logs],
                'network_mode': self.network_mode,
            }
            with open(self.persistence_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Warning: Failed to save state to {self.persistence_file}: {e}")

    # ──────────────────────────────────────────
    # Waste Management
    # ──────────────────────────────────────────

    def add_waste_item(self, item: WasteItem):
        self.waste_items.append(item)
        self.save()

    def update_waste_item(self, item_id: str, updates: Dict[str, Any]):
        for item in self.waste_items:
            if item.id == item_id:
                for k, v in updates.items():
                    if hasattr(item, k):
                        setattr(item, k, v)
                break
        self.save()

    def get_waste_by_ids(self, ids: List[str]) -> List[WasteItem]:
        id_set = set(ids)
        return [i for i in self.waste_items if i.id in id_set]

    # ──────────────────────────────────────────
    # Lot Management
    # ──────────────────────────────────────────

    def create_pickup_lot(self, bundle: ProposedLotBundle, lot_number: Optional[str] = None) -> PickupLot:
        lot = QuotaPackerEngine.create_lot_record(bundle, lot_number)
        self.pickup_lots.append(lot)

        # Mark bundled items as IN_LOT
        for item in bundle.selected_items:
            self.update_waste_item(item.id, {
                'status': 'IN_LOT',
                'assigned_lot_id': lot.id
            })

        # Add initial staging custody event
        staging_event = CustodyEvent(
            id=f"cust-{int(datetime.now().timestamp() * 1000)}",
            lot_id=lot.id,
            timestamp=datetime.now().isoformat(),
            actor_name="HazardHub Operations System",
            actor_role="SYSTEM_AGENT",
            action="LOT_STAGED",
            location=f"Multi-Lab Co-Op Depot ({len(lot.participating_lab_ids)} Facilities)",
            cryptographic_hash=f"SHA256-STAGE-{lot.id[-6:]}",
            sync_status="SYNCED" if self.network_mode == "ONLINE" else "PENDING_OFFLINE",
            details=f"Lot {lot.lot_number} staged with {len(lot.waste_item_ids)} containers ({lot.total_volume_liters:.1f}L).",
        )
        self.custody_events.append(staging_event)

        self.save()
        return lot

    def add_custody_event(self, event: CustodyEvent):
        self.custody_events.append(event)
        self.save()

    # ──────────────────────────────────────────
    # Disruption & Self-Healing Execution
    # ──────────────────────────────────────────

    def handle_canister_rejection(
        self,
        lot_id: str,
        rejected_item_id: str,
        reason: str = "DAMAGED_LEAKING"
    ) -> Optional[RecoveryPlan]:
        lot = next((l for l in self.pickup_lots if l.id == lot_id), None)
        rejected_item = next((i for i in self.waste_items if i.id == rejected_item_id), None)
        if not lot or not rejected_item:
            return None

        current_items = self.get_waste_by_ids(lot.waste_item_ids)
        available_pool = [i for i in self.waste_items if i.status == 'AVAILABLE']

        plan = ResilienceGuardEngine.plan_canister_rejection_recovery(
            lot, rejected_item, reason, current_items, available_pool
        )

        # 1. Mark rejected item as QUARANTINED
        self.update_waste_item(rejected_item.id, {
            'status': 'QUARANTINED',
            'condition': 'LEAKING' if 'LEAK' in reason else rejected_item.condition,
            'assigned_lot_id': None,
        })

        # 2. Add replacement standby items to lot
        for rep_id in plan.replacement_item_ids:
            self.update_waste_item(rep_id, {
                'status': 'IN_LOT',
                'assigned_lot_id': lot.id,
            })

        # 3. Update lot record
        new_item_ids = [id for id in lot.waste_item_ids if id != rejected_item_id] + plan.replacement_item_ids
        lot.waste_item_ids = new_item_ids
        lot.total_volume_liters = plan.new_projected_volume
        lot.is_threshold_met = (plan.new_projected_volume >= lot.target_threshold_liters)
        lot.rejection_incident_count += 1

        # 4. Log disruption
        log = DisruptionLog(
            id=f"disrupt-{int(datetime.now().timestamp() * 1000)}",
            timestamp=datetime.now().isoformat(),
            type='CONTAINER_REJECTED',
            description=plan.description,
            recovery_action_taken=plan.explanation,
            recovered_volume_delta=sum(i.volume_liters for i in plan.replacement_items),
        )
        self.disruption_logs.append(log)

        # 5. Add custody record
        custody_event = CustodyEvent(
            id=f"cust-{int(datetime.now().timestamp() * 1000)}",
            lot_id=lot.id,
            timestamp=datetime.now().isoformat(),
            actor_name="Officer Daniel Vance (Hauler Driver)",
            actor_role="HAULER_DRIVER",
            action="CONTAINER_REJECTED",
            location="Dock Inspection Bay 4",
            cryptographic_hash=f"SHA256-REJECT-{rejected_item.id[-4:]}",
            sync_status="SYNCED" if self.network_mode == "ONLINE" else "PENDING_OFFLINE",
            details=f"Rejected {rejected_item.name} ({rejected_item.volume_liters:.1f}L). Standby container promoted.",
        )
        self.custody_events.append(custody_event)

        self.save()
        return plan

    def set_network_mode(self, mode: NetworkMode):
        self.network_mode = mode
        if mode == 'ONLINE':
            # Auto-sync any pending offline custody events
            for event in self.custody_events:
                if event.sync_status == 'PENDING_OFFLINE':
                    event.sync_status = 'SYNCED'
        self.save()


# Singleton state accessor
_GLOBAL_STATE: Optional[StateManager] = None


def get_state() -> StateManager:
    global _GLOBAL_STATE
    if _GLOBAL_STATE is None:
        _GLOBAL_STATE = StateManager()
    return _GLOBAL_STATE
