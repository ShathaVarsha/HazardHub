"""
ResilienceGuard Adaptive Disruption Engine
Pure Python equivalent to src/engines/resilienceguard/resilienceguard.ts
Handles dockside canister rejections (leaks, illegible labels) and institutional lab withdrawals,
automatically computing replacement strategies and promoting standby containers to preserve the >=150L hauler threshold.
"""

from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any

from models import PickupLot, WasteItem, DisruptionLog, RecoveryPlan, DisruptionType
from engines.chemiguard import ChemiGuardEngine


class ResilienceGuardEngine:
    """
    Autonomous self-healing engine for supply-chain and dockside disruptions.
    """

    @classmethod
    def plan_lab_cancellation_recovery(
        cls,
        lot: PickupLot,
        cancelled_lab_id: str,
        current_lot_items: List[WasteItem],
        available_pool: List[WasteItem],
    ) -> RecoveryPlan:
        """
        Evaluates the impact of a participating laboratory abruptly cancelling its pickup commitment.
        """
        cancelled_items = [i for i in current_lot_items if i.lab_id == cancelled_lab_id]
        lost_volume = sum(i.volume_liters for i in cancelled_items)
        remaining_items = [i for i in current_lot_items if i.lab_id != cancelled_lab_id]
        remaining_volume = sum(i.volume_liters for i in remaining_items)

        is_below_threshold = remaining_volume < lot.target_threshold_liters
        replacement_items: List[WasteItem] = []
        recovered_volume = 0.0

        if is_below_threshold:
            # Search candidate standby containers from non-cancelled labs
            candidates = [
                item for item in available_pool
                if item.lab_id != cancelled_lab_id
                and not any(curr.id == item.id for curr in current_lot_items)
                and item.status != 'IN_LOT'
                and item.condition != 'LEAKING'
                and all(ChemiGuardEngine.check_pair(item, rem) is None for rem in remaining_items)
            ]

            # Sort candidates by volume descending
            candidates.sort(key=lambda x: x.volume_liters, reverse=True)

            for candidate in candidates:
                # Check compatibility with already added replacements
                is_compatible_with_replacements = all(
                    ChemiGuardEngine.check_pair(candidate, rep) is None
                    for rep in replacement_items
                )

                if is_compatible_with_replacements:
                    replacement_items.append(candidate)
                    recovered_volume += candidate.volume_liters

                    if remaining_volume + recovered_volume >= lot.target_threshold_liters:
                        break

        new_projected_volume = remaining_volume + recovered_volume
        can_be_fully_restored = (not is_below_threshold) or (new_projected_volume >= lot.target_threshold_liters)

        if can_be_fully_restored:
            if is_below_threshold:
                explanation = (
                    f"ResilienceGuard identified {len(replacement_items)} compatible standby container(s) "
                    f"(+{recovered_volume:.1f}L). Quota will be restored to {new_projected_volume:.1f}L "
                    f"(>= {lot.target_threshold_liters:.1f}L)."
                )
            else:
                explanation = (
                    f"Lot volume remains above quota ({remaining_volume:.1f}L >= {lot.target_threshold_liters:.1f}L) "
                    f"thanks to the initial reserve safety buffer."
                )
        else:
            explanation = (
                f"Insufficient compatible standby waste available in region (+{recovered_volume:.1f}L found). "
                f"Lot projected at {new_projected_volume:.1f}L, which is under the {lot.target_threshold_liters:.1f}L "
                f"hauler quota. Additional lab pooling required."
            )

        return RecoveryPlan(
            lot_id=lot.id,
            disruption_type='LAB_CANCELLATION',
            description=f"Lab #{cancelled_lab_id} withdrew {len(cancelled_items)} container(s) totaling {lost_volume:.1f} L.",
            affected_volume_liters=lost_volume,
            remaining_volume_before_recovery=remaining_volume,
            threshold_liters=lot.target_threshold_liters,
            is_below_threshold=is_below_threshold,
            can_be_fully_restored=can_be_fully_restored,
            replacement_item_ids=[i.id for i in replacement_items],
            replacement_items=replacement_items,
            new_projected_volume=new_projected_volume,
            explanation=explanation,
        )

    @classmethod
    def plan_canister_rejection_recovery(
        cls,
        lot: PickupLot,
        rejected_item: WasteItem,
        reason: str,
        current_lot_items: List[WasteItem],
        available_pool: List[WasteItem],
    ) -> RecoveryPlan:
        """
        Evaluates partial hauler rejection at the loading dock (e.g. leaking drum or unreadable label).
        Promotes pre-approved standby containers to prevent lot cancellation.
        """
        remaining_items = [i for i in current_lot_items if i.id != rejected_item.id]
        remaining_volume = sum(i.volume_liters for i in remaining_items)
        is_below_threshold = remaining_volume < lot.target_threshold_liters

        replacement_items: List[WasteItem] = []
        recovered_volume = 0.0

        if is_below_threshold:
            # Look first in lot's pre-approved standby containers / available pool
            standby_candidates = [
                item for item in available_pool
                if item.id != rejected_item.id
                and item.condition != 'LEAKING'
                and not any(curr.id == item.id for curr in current_lot_items)
                and all(ChemiGuardEngine.check_pair(item, rem) is None for rem in remaining_items)
            ]

            for candidate in standby_candidates:
                replacement_items.append(candidate)
                recovered_volume += candidate.volume_liters
                if remaining_volume + recovered_volume >= lot.target_threshold_liters:
                    break

        new_projected_volume = remaining_volume + recovered_volume
        can_be_fully_restored = (not is_below_threshold) or (new_projected_volume >= lot.target_threshold_liters)

        if is_below_threshold:
            if can_be_fully_restored:
                explanation = (
                    f"Volume fell to {remaining_volume:.1f}L (< {lot.target_threshold_liters:.1f}L). "
                    f"ResilienceGuard promoted standby container (+{recovered_volume:.1f}L) to restore hauler dispatch."
                )
            else:
                explanation = (
                    f"Lot dropped to {remaining_volume:.1f}L (< {lot.target_threshold_liters:.1f}L) "
                    f"and insufficient compatible standby containers were available."
                )
        else:
            explanation = (
                f"Remaining lot volume is {remaining_volume:.1f}L, safely protected above the "
                f"{lot.target_threshold_liters:.1f}L quota by the initial reserve buffer."
            )

        return RecoveryPlan(
            lot_id=lot.id,
            disruption_type='CONTAINER_REJECTED',
            description=f"Hauler driver rejected {rejected_item.name} ({rejected_item.volume_liters:.1f}L) due to {reason}.",
            affected_volume_liters=rejected_item.volume_liters,
            remaining_volume_before_recovery=remaining_volume,
            threshold_liters=lot.target_threshold_liters,
            is_below_threshold=is_below_threshold,
            can_be_fully_restored=can_be_fully_restored,
            replacement_item_ids=[i.id for i in replacement_items],
            replacement_items=replacement_items,
            new_projected_volume=new_projected_volume,
            explanation=explanation,
        )
