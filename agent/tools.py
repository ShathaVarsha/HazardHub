"""
AI Operations Agent Tool Calling Interface
Pure Python equivalent to src/agent/tools.ts
Allows natural language agents to query state, run ChemiGuard audits, and execute QuotaPacker optimizations.
"""

from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from storage.state import StateManager
from engines.chemiguard import ChemiGuardEngine
from engines.quotapacker import QuotaPackerEngine, AutoBundleOptions


@dataclass
class ToolExecutionResult:
    tool_name: str
    parameters: Dict[str, Any]
    result: Any
    summary: str


class OperationsAgentTools:
    """
    Structured tool invocations executable by the autonomous operations agent.
    """

    @staticmethod
    def inspect_urgent_waste(state: StateManager, days_limit: int = 14) -> ToolExecutionResult:
        """
        Retrieves all waste items nearing their expiration date.
        """
        all_waste = state.waste_items
        urgent = [
            w for w in all_waste
            if (w.status in ('AVAILABLE', 'RESERVED')) and (w.days_until_expiring <= days_limit)
        ]
        urgent.sort(key=lambda x: x.days_until_expiring)
        total_vol = sum(w.volume_liters for w in urgent)

        return ToolExecutionResult(
            tool_name='inspectUrgentWaste',
            parameters={'days_limit': days_limit},
            result=[w.to_dict() for w in urgent],
            summary=f"Found {len(urgent)} urgent container(s) expiring within {days_limit} days totaling {total_vol:.1f} Liters.",
        )

    @staticmethod
    def check_compatibility(state: StateManager, item_ids: List[str]) -> ToolExecutionResult:
        """
        Evaluates pairwise safety for a list of chemical IDs using ChemiGuard.
        """
        target_items = [w for w in state.waste_items if w.id in set(item_ids)]
        check = ChemiGuardEngine.evaluate_lot(target_items)

        if check.is_safe:
            summary = f"ChemiGuard verified {check.checked_count} pairs: 100% EPA Safe. No reactive hazards."
        else:
            primary_hazard = check.issues[0].hazard_description if check.issues else "Unknown"
            summary = f"ChemiGuard detected {len(check.issues)} violation(s)! Primary risk: {primary_hazard}."

        return ToolExecutionResult(
            tool_name='checkCompatibility',
            parameters={'item_ids': item_ids, 'chemical_names': [i.name for i in target_items]},
            result=check.to_dict(),
            summary=summary,
        )

    @staticmethod
    def propose_optimal_lot(state: StateManager, min_threshold: float = 150.0) -> ToolExecutionResult:
        """
        Runs the QuotaPacker Knapsack optimizer to form a >=150L lot + 15% buffer.
        """
        eligible = [w for w in state.waste_items if w.status == 'AVAILABLE' and w.condition != 'LEAKING']
        bundle = QuotaPackerEngine.auto_bundle(eligible, AutoBundleOptions(
            min_threshold_liters=min_threshold,
            reserve_buffer_percent=15.0,
        ))

        if bundle.is_threshold_met:
            summary = (
                f"Successfully assembled {bundle.total_volume_liters:.1f} L across "
                f"{len(bundle.participating_lab_ids)} labs with {len(bundle.standby_reserve_items)} "
                f"standby reserve containers. 100% EPA Compatible."
            )
        else:
            shortage = min_threshold - bundle.total_volume_liters
            summary = (
                f"Available pool has {bundle.total_volume_liters:.1f} L, which is "
                f"{shortage:.1f} L short of the {min_threshold:.1f} L quota."
            )

        return ToolExecutionResult(
            tool_name='proposeOptimalLot',
            parameters={'min_threshold': min_threshold, 'buffer_target': min_threshold * 1.15},
            result=bundle,
            summary=summary,
        )

    @staticmethod
    def query_readiness(state: StateManager) -> ToolExecutionResult:
        """
        Summarizes regional readiness across all labs.
        """
        labs = state.labs
        waste = state.waste_items
        lots = state.pickup_lots

        active_waste = [w for w in waste if w.status == 'AVAILABLE']
        total_volume = sum(w.volume_liters for w in active_waste)
        urgent_count = len([w for w in active_waste if w.urgency == 'URGENT'])

        return ToolExecutionResult(
            tool_name='queryReadiness',
            parameters={},
            result={
                'total_volume': total_volume,
                'urgent_count': urgent_count,
                'lab_count': len(labs),
                'lot_count': len(lots),
            },
            summary=(
                f"Regional Pool: {total_volume:.1f} L ready waste across {len(labs)} laboratories. "
                f"{urgent_count} urgent items. {len(lots)} active pickup lots."
            ),
        )
