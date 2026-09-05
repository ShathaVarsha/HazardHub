"""
ChemiGuard Deterministic EPA Compatibility Engine
Pure Python equivalent to src/engines/chemiguard/chemiguard.ts
Enforces EPA 40 CFR Part 264 Appendix V compatibility rules and pairwise safety checks.
"""

from typing import List, Optional, Tuple, Dict
from models import WasteItem, IncompatibilityIssue, CompatibilityCheckResult
from data.matrix import EPA_INCOMPATIBILITY_RULES


class ChemiGuardEngine:
    """
    Deterministic EPA 40 CFR Part 264 Appendix V Safety Engine.
    Evaluates chemical combinations for explosive, toxic gas, corrosive spatter, or fire hazards.
    """

    @staticmethod
    def check_pair(item_a: WasteItem, item_b: WasteItem) -> Optional[IncompatibilityIssue]:
        """
        Deterministically evaluates if two individual waste items can be co-loaded or stored together.
        Checks both (A, B) and (B, A) orientations against the EPA 40 CFR Part 264 App. V rules.
        """
        if item_a.id == item_b.id:
            return None

        # Check EPA Matrix Rules
        for rule in EPA_INCOMPATIBILITY_RULES:
            match_direct = item_a.epa_group == rule.group_a and item_b.epa_group == rule.group_b
            match_inverse = item_a.epa_group == rule.group_b and item_b.epa_group == rule.group_a

            if match_direct or match_inverse:
                return IncompatibilityIssue(
                    item_a_id=item_a.id,
                    item_a_name=item_a.name,
                    item_a_group=item_a.epa_group,
                    item_b_id=item_b.id,
                    item_b_name=item_b.name,
                    item_b_group=item_b.epa_group,
                    hazard_description=f"{rule.hazard_title} ({rule.epa_citation})",
                    consequence=rule.consequence,
                    remedy_recommendation=f"{rule.scientific_explanation} Action: {rule.remedy}",
                )

        # Specific high-hazard chemical name overrides
        name_a = item_a.name.lower()
        name_b = item_b.name.lower()

        # Nitric Acid + Acetone/Organic Solvents specific override
        solvents = ('acetone', 'alcohol', 'xylene', 'solvent')
        a_is_nitric = 'nitric' in name_a
        b_is_nitric = 'nitric' in name_b
        a_is_solvent = any(s in name_a for s in solvents)
        b_is_solvent = any(s in name_b for s in solvents)

        if (a_is_nitric and b_is_solvent) or (b_is_nitric and a_is_solvent):
            return IncompatibilityIssue(
                item_a_id=item_a.id,
                item_a_name=item_a.name,
                item_a_group=item_a.epa_group,
                item_b_id=item_b.id,
                item_b_name=item_b.name,
                item_b_group=item_b.epa_group,
                hazard_description='CRITICAL EXPLOSION HAZARD: Nitric Acid + Organic Solvent Detonation Risk',
                consequence='EXPLOSION',
                remedy_recommendation=(
                    'Nitric acid reacts explosively with acetone, alcohols, and ketones forming shock-sensitive '
                    'organic nitrates. Segregate immediately.'
                ),
            )

        return None

    @classmethod
    def evaluate_lot(cls, items: List[WasteItem]) -> CompatibilityCheckResult:
        """
        Evaluates all N*(N-1)/2 pairwise combinations across a proposed pickup lot.
        Returns complete audit trail of all safety infractions.
        """
        issues: List[IncompatibilityIssue] = []
        checked_count = 0

        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                checked_count += 1
                issue = cls.check_pair(items[i], items[j])
                if issue:
                    issues.append(issue)

        return CompatibilityCheckResult(
            is_safe=(len(issues) == 0),
            issues=issues,
            checked_count=checked_count,
        )

    @classmethod
    def find_safe_substitutes(
        cls,
        offending_item: WasteItem,
        current_lot_without_offender: List[WasteItem],
        available_pool: List[WasteItem],
    ) -> List[WasteItem]:
        """
        Proposes safe alternative replacement containers from the pool
        that can replace an offending item without violating any safety rules.
        """
        safe_candidates: List[WasteItem] = []
        for candidate in available_pool:
            if candidate.id == offending_item.id:
                continue
            if candidate.status != 'AVAILABLE':
                continue
            if candidate.condition == 'LEAKING':
                continue

            # Check if candidate is safe with ALL other items currently in the lot
            is_compatible = True
            for existing in current_lot_without_offender:
                if cls.check_pair(candidate, existing) is not None:
                    is_compatible = False
                    break

            if is_compatible:
                safe_candidates.append(candidate)

        return safe_candidates

    @classmethod
    def split_into_safe_lots(cls, items: List[WasteItem]) -> Tuple[List[WasteItem], List[WasteItem]]:
        """
        Graph partitioning: Separates an incompatible collection into two mutually compatible sub-lots.
        """
        lot1: List[WasteItem] = []
        lot2: List[WasteItem] = []

        for item in items:
            can_add_to_lot1 = all(cls.check_pair(item, existing) is None for existing in lot1)
            if can_add_to_lot1:
                lot1.append(item)
            else:
                lot2.append(item)

        return lot1, lot2
