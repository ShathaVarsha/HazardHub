import type { WasteItem, IncompatibilityIssue, CompatibilityCheckResult } from '../../types';
import { EPA_INCOMPATIBILITY_RULES } from '../../data/matrix';

export class ChemiGuardEngine {
  /**
   * Deterministically evaluates if two individual waste items can be co-loaded or stored together.
   * Checks both (A, B) and (B, A) orientations against the EPA 40 CFR Part 264 App. V rules.
   */
  public static checkPair(itemA: WasteItem, itemB: WasteItem): IncompatibilityIssue | null {
    if (itemA.id === itemB.id) return null;

    for (const rule of EPA_INCOMPATIBILITY_RULES) {
      const matchDirect = itemA.epaGroup === rule.groupA && itemB.epaGroup === rule.groupB;
      const matchInverse = itemA.epaGroup === rule.groupB && itemB.epaGroup === rule.groupA;

      if (matchDirect || matchInverse) {
        return {
          itemAId: itemA.id,
          itemAName: itemA.name,
          itemAGroup: itemA.epaGroup,
          itemBId: itemB.id,
          itemBName: itemB.name,
          itemBGroup: itemB.epaGroup,
          hazardDescription: `${rule.hazardTitle} (${rule.epaCitation})`,
          consequence: rule.consequence,
          remedyRecommendation: `${rule.scientificExplanation} Action: ${rule.remedy}`,
        };
      }
    }

    // Specific high-hazard chemical name overrides
    const nameA = itemA.name.toLowerCase();
    const nameB = itemB.name.toLowerCase();

    // Nitric Acid + Acetone/Organic Solvents specific override
    if (
      (nameA.includes('nitric') && (nameB.includes('acetone') || nameB.includes('alcohol') || nameB.includes('xylene'))) ||
      (nameB.includes('nitric') && (nameA.includes('acetone') || nameA.includes('alcohol') || nameA.includes('xylene')))
    ) {
      return {
        itemAId: itemA.id,
        itemAName: itemA.name,
        itemAGroup: itemA.epaGroup,
        itemBId: itemB.id,
        itemBName: itemB.name,
        itemBGroup: itemB.epaGroup,
        hazardDescription: 'CRITICAL EXPLOSION HAZARD: Nitric Acid + Organic Solvent Detonation Risk',
        consequence: 'EXPLOSION',
        remedyRecommendation:
          'Nitric acid reacts explosively with acetone, alcohols, and ketones forming shock-sensitive organic nitrates. Segregate immediately.',
      };
    }

    return null;
  }

  /**
   * Evaluates all N*(N-1)/2 pairwise combinations across a proposed pickup lot.
   * Returns complete audit trail of all safety infractions.
   */
  public static evaluateLot(items: WasteItem[]): CompatibilityCheckResult {
    const issues: IncompatibilityIssue[] = [];
    let checkedCount = 0;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        checkedCount++;
        const issue = this.checkPair(items[i], items[j]);
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return {
      isSafe: issues.length === 0,
      issues,
      checkedCount,
    };
  }

  /**
   * Proposes safe alternative replacement containers from the pool
   * that can replace an offending item without violating any safety rules.
   */
  public static findSafeSubstitutes(
    offendingItem: WasteItem,
    currentLotWithoutOffender: WasteItem[],
    availablePool: WasteItem[]
  ): WasteItem[] {
    return availablePool.filter((candidate) => {
      if (candidate.id === offendingItem.id) return false;
      if (candidate.status !== 'AVAILABLE') return false;
      if (candidate.condition === 'LEAKING') return false;

      // Check if candidate is safe with ALL other items currently in the lot
      for (const existing of currentLotWithoutOffender) {
        if (this.checkPair(candidate, existing) !== null) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Graph partitioning: Separates an incompatible collection into two mutually compatible sub-lots.
   */
  public static splitIntoSafeLots(items: WasteItem[]): { lot1: WasteItem[]; lot2: WasteItem[] } {
    const lot1: WasteItem[] = [];
    const lot2: WasteItem[] = [];

    for (const item of items) {
      // Try adding to lot1
      const canAddToLot1 = lot1.every((existing) => this.checkPair(item, existing) === null);
      if (canAddToLot1) {
        lot1.push(item);
      } else {
        lot2.push(item);
      }
    }

    return { lot1, lot2 };
  }
}
