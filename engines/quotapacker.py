"""
QuotaPacker Knapsack Pooling Engine
Pure Python equivalent to src/engines/quotapacker/quotapacker.ts
Optimizes multi-institutional waste lot assembly to reach >=150L hauler threshold + 15% safety buffer.
"""

from datetime import datetime, timedelta
import random
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

from models import WasteItem, PickupLot, CompatibilityCheckResult, ProposedLotBundle
from engines.chemiguard import ChemiGuardEngine


@dataclass
class AutoBundleOptions:
    min_threshold_liters: float = 150.0
    reserve_buffer_percent: float = 15.0  # e.g. 15% -> target is 150 * 1.15 = 172.5L
    preferred_lab_ids: Optional[List[str]] = None
    max_stops: Optional[int] = None


class QuotaPackerEngine:
    DEFAULT_MIN_THRESHOLD: float = 150.0
    DEFAULT_BUFFER_PERCENT: float = 15.0  # 15% safety margin

    @classmethod
    def auto_bundle(
        cls,
        available_pool: List[WasteItem],
        options: Optional[AutoBundleOptions] = None,
    ) -> ProposedLotBundle:
        """
        1-Click Auto-Bundle heuristic:
        Greedily bundles compatible waste prioritizing expiring urgent containers
        until the threshold + reserve buffer is met.
        """
        opts = options or AutoBundleOptions()
        min_threshold = opts.min_threshold_liters
        buffer_percent = opts.reserve_buffer_percent
        target_with_buffer = min_threshold * (1.0 + buffer_percent / 100.0)

        # 1. Filter out already assigned or leaking containers
        eligible_pool = [
            item for item in available_pool
            if item.status == 'AVAILABLE' and item.condition != 'LEAKING'
        ]

        # 2. Sort pool by urgency priority: URGENT (4) > HIGH (3) > MEDIUM (2) > LOW (1)
        urgency_weights = {
            'URGENT': 4,
            'HIGH': 3,
            'MEDIUM': 2,
            'LOW': 1,
        }

        sorted_candidates = sorted(
            eligible_pool,
            key=lambda x: (-urgency_weights.get(x.urgency, 0), x.days_until_expiring)
        )

        # 3. Greedily assemble compatible cluster
        selected: List[WasteItem] = []
        accumulated_volume = 0.0

        for candidate in sorted_candidates:
            # Check pairwise compatibility against all already selected items
            is_compatible = all(
                ChemiGuardEngine.check_pair(candidate, existing) is None
                for existing in selected
            )

            if is_compatible:
                selected.append(candidate)
                accumulated_volume += candidate.volume_liters

                # If target with safety buffer is met, stop core selection
                if accumulated_volume >= target_with_buffer:
                    break

        # 4. Identify 1-2 Standby Reserve candidates from remaining pool
        remaining_pool = [c for c in sorted_candidates if not any(s.id == c.id for s in selected)]
        standby_reserves: List[WasteItem] = []

        for candidate in remaining_pool:
            # Must be compatible with the selected lot
            is_compatible_with_lot = all(
                ChemiGuardEngine.check_pair(candidate, s) is None
                for s in selected
            )
            if is_compatible_with_lot:
                standby_reserves.append(candidate)
                if len(standby_reserves) >= 2:
                    break

        # 5. Build proposal output
        participating_labs = sorted(list(set(i.lab_id for i in selected)))
        compatibility = ChemiGuardEngine.evaluate_lot(selected)

        return ProposedLotBundle(
            selected_items=selected,
            standby_reserve_items=standby_reserves,
            total_volume_liters=accumulated_volume,
            target_threshold_liters=min_threshold,
            reserve_buffer_liters=max(0.0, accumulated_volume - min_threshold),
            is_threshold_met=(accumulated_volume >= min_threshold),
            participating_lab_ids=participating_labs,
            compatibility=compatibility,
            urgency_breakdown={
                'urgent_count': len([i for i in selected if i.urgency == 'URGENT']),
                'high_count': len([i for i in selected if i.urgency == 'HIGH']),
                'medium_count': len([i for i in selected if i.urgency == 'MEDIUM']),
                'low_count': len([i for i in selected if i.urgency == 'LOW']),
            },
        )

    @staticmethod
    def create_lot_record(bundle: ProposedLotBundle, lot_number: Optional[str] = None) -> PickupLot:
        """
        Helper to format a confirmed bundle into a formal PickupLot entity.
        """
        now = datetime.now()
        timestamp_str = now.strftime('%Y%m%d')
        random_suffix = random.randint(1000, 9999)
        generated_number = lot_number or f"LOT-{timestamp_str}-{random_suffix}"

        scheduled = now + timedelta(days=2)  # 48h dispatch window
        scheduled_date_str = scheduled.strftime('%Y-%m-%d')

        return PickupLot(
            id=f"lot-{int(now.timestamp() * 1000)}",
            lot_number=generated_number,
            created_at=now.isoformat(),
            scheduled_date=scheduled_date_str,
            status='SCHEDULED',
            waste_item_ids=[i.id for i in bundle.selected_items],
            total_volume_liters=bundle.total_volume_liters,
            target_threshold_liters=bundle.target_threshold_liters,
            reserve_buffer_liters=bundle.reserve_buffer_liters,
            is_threshold_met=bundle.is_threshold_met,
            participating_lab_ids=bundle.participating_lab_ids,
            hauler_name='CleanHarbors Regional Environmental Logistics',
            hauler_truck_plate='MA-COMM-8924',
            hauler_driver_name='Officer Daniel Vance (CDL Hazmat Certified)',
            standby_waste_item_ids=[i.id for i in bundle.standby_reserve_items],
            rejection_incident_count=0,
        )
