import type { PickupLot, WasteItem, DisruptionLog } from '../../types';
import { ChemiGuardEngine } from '../chemiguard/chemiguard';
import { db } from '../../storage/db';

export interface RecoveryPlan {
  lotId: string;
  disruptionType: 'LAB_CANCELLATION' | 'CONTAINER_REJECTED' | 'CONTAINER_DAMAGED';
  description: string;
  affectedVolumeLiters: number;
  remainingVolumeBeforeRecovery: number;
  thresholdLiters: number;
  isBelowThreshold: boolean;
  canBeFullyRestored: boolean;
  replacementItemIds: string[];
  replacementItems: WasteItem[];
  newProjectedVolume: number;
  explanation: string;
}

export class ResilienceGuardEngine {
  /**
   * Evaluates impact of a lab cancelling its pickup commitment.
   */
  public static planLabCancellationRecovery(
    lot: PickupLot,
    cancelledLabId: string,
    currentLotItems: WasteItem[],
    availablePool: WasteItem[]
  ): RecoveryPlan {
    const cancelledItems = currentLotItems.filter((i) => i.labId === cancelledLabId);
    const lostVolume = cancelledItems.reduce((s, i) => s + i.volumeLiters, 0);
    const remainingItems = currentLotItems.filter((i) => i.labId !== cancelledLabId);
    const remainingVolume = remainingItems.reduce((s, i) => s + i.volumeLiters, 0);

    const isBelowThreshold = remainingVolume < lot.targetThresholdLiters;
    const replacementItems: WasteItem[] = [];
    let recoveredVolume = 0;

    if (isBelowThreshold) {
      // 1. Search candidate standby containers from non-cancelled labs
      const candidates = availablePool.filter((item) => {
        if (item.labId === cancelledLabId) return false;
        if (currentLotItems.some((curr) => curr.id === item.id)) return false;
        if (item.status === 'IN_LOT' || item.condition === 'LEAKING') return false;

        // Must be compatible with all remaining items in the lot
        return remainingItems.every((rem) => ChemiGuardEngine.checkPair(item, rem) === null);
      });

      // Sort candidates by urgency, then volume
      candidates.sort((a, b) => b.volumeLiters - a.volumeLiters);

      for (const candidate of candidates) {
        // Check compatibility with already added replacements
        const isCompatibleWithReplacements = replacementItems.every(
          (rep) => ChemiGuardEngine.checkPair(candidate, rep) === null
        );

        if (isCompatibleWithReplacements) {
          replacementItems.push(candidate);
          recoveredVolume += candidate.volumeLiters;

          if (remainingVolume + recoveredVolume >= lot.targetThresholdLiters) {
            break;
          }
        }
      }
    }

    const newProjectedVolume = remainingVolume + recoveredVolume;
    const canBeFullyRestored = !isBelowThreshold || newProjectedVolume >= lot.targetThresholdLiters;

    return {
      lotId: lot.id,
      disruptionType: 'LAB_CANCELLATION',
      description: `Lab #${cancelledLabId} withdrew ${cancelledItems.length} container(s) totaling ${lostVolume.toFixed(1)} L.`,
      affectedVolumeLiters: lostVolume,
      remainingVolumeBeforeRecovery: remainingVolume,
      thresholdLiters: lot.targetThresholdLiters,
      isBelowThreshold,
      canBeFullyRestored,
      replacementItemIds: replacementItems.map((i) => i.id),
      replacementItems,
      newProjectedVolume,
      explanation: canBeFullyRestored
        ? isBelowThreshold
          ? `ResilienceGuard identified ${replacementItems.length} compatible standby container(s) (+${recoveredVolume.toFixed(1)}L). Quota will be restored to ${newProjectedVolume.toFixed(1)}L (>= ${lot.targetThresholdLiters}L).`
          : `Lot volume remains above quota (${remainingVolume.toFixed(1)}L >= ${lot.targetThresholdLiters}L) thanks to the initial reserve safety buffer.`
        : `Insufficient compatible standby waste available in region (+${recoveredVolume.toFixed(1)}L found). Lot projected at ${newProjectedVolume.toFixed(1)}L, which is under the ${lot.targetThresholdLiters}L hauler quota. Additional lab pooling required.`,
    };
  }

  /**
   * Evaluates partial hauler rejection at the loading dock (e.g. leaking drum or unreadable label).
   */
  public static planCanisterRejectionRecovery(
    lot: PickupLot,
    rejectedItem: WasteItem,
    reason: 'DAMAGED_LEAKING' | 'LABEL_ILLEGIBLE' | 'CONTAINER_BULGING',
    currentLotItems: WasteItem[],
    availablePool: WasteItem[]
  ): RecoveryPlan {
    const remainingItems = currentLotItems.filter((i) => i.id !== rejectedItem.id);
    const remainingVolume = remainingItems.reduce((s, i) => s + i.volumeLiters, 0);
    const isBelowThreshold = remainingVolume < lot.targetThresholdLiters;

    const replacementItems: WasteItem[] = [];
    let recoveredVolume = 0;

    if (isBelowThreshold) {
      // Look first in lot's pre-approved standby containers
      const standbyCandidates = availablePool.filter((item) => {
        if (item.id === rejectedItem.id) return false;
        if (item.condition === 'LEAKING') return false;
        if (currentLotItems.some((curr) => curr.id === item.id)) return false;

        return remainingItems.every((rem) => ChemiGuardEngine.checkPair(item, rem) === null);
      });

      for (const candidate of standbyCandidates) {
        replacementItems.push(candidate);
        recoveredVolume += candidate.volumeLiters;
        if (remainingVolume + recoveredVolume >= lot.targetThresholdLiters) break;
      }
    }

    const newProjectedVolume = remainingVolume + recoveredVolume;
    const canBeFullyRestored = !isBelowThreshold || newProjectedVolume >= lot.targetThresholdLiters;

    return {
      lotId: lot.id,
      disruptionType: 'CONTAINER_REJECTED',
      description: `Hauler driver rejected ${rejectedItem.name} (${rejectedItem.volumeLiters.toFixed(1)}L) due to ${reason}.`,
      affectedVolumeLiters: rejectedItem.volumeLiters,
      remainingVolumeBeforeRecovery: remainingVolume,
      thresholdLiters: lot.targetThresholdLiters,
      isBelowThreshold,
      canBeFullyRestored,
      replacementItemIds: replacementItems.map((i) => i.id),
      replacementItems,
      newProjectedVolume,
      explanation: isBelowThreshold
        ? canBeFullyRestored
          ? `Volume fell to ${remainingVolume.toFixed(1)}L (< ${lot.targetThresholdLiters}L). ResilienceGuard promoted standby container (+${recoveredVolume.toFixed(1)}L) to restore hauler dispatch.`
          : `Lot dropped to ${remainingVolume.toFixed(1)}L (< ${lot.targetThresholdLiters}L) and insufficient compatible standby containers were available.`
        : `Remaining lot volume is ${remainingVolume.toFixed(1)}L, safely protected above the ${lot.targetThresholdLiters}L quota by the initial reserve buffer.`,
    };
  }

  /**
   * Executes the recovery plan atomically in Dexie IndexedDB.
   */
  public static async executeRecoveryPlan(
    lot: PickupLot,
    plan: RecoveryPlan,
    offendingItemIdsToRemove: string[]
  ): Promise<void> {
    await db.transaction('rw', [db.pickupLots, db.wasteItems, db.disruptionLogs], async () => {
      // 1. Remove cancelled or rejected items from the lot
      for (const id of offendingItemIdsToRemove) {
        await db.wasteItems.update(id, {
          status: plan.disruptionType === 'CONTAINER_REJECTED' ? 'QUARANTINED' : 'AVAILABLE',
          assignedLotId: undefined,
        });
      }

      // 2. Add replacement items to the lot
      for (const id of plan.replacementItemIds) {
        await db.wasteItems.update(id, {
          status: 'IN_LOT',
          assignedLotId: lot.id,
        });
      }

      // 3. Update the lot record
      const updatedItemIds = lot.wasteItemIds
        .filter((id) => !offendingItemIdsToRemove.includes(id))
        .concat(plan.replacementItemIds);

      await db.pickupLots.update(lot.id, {
        wasteItemIds: updatedItemIds,
        totalVolumeLiters: plan.newProjectedVolume,
        isThresholdMet: plan.newProjectedVolume >= lot.targetThresholdLiters,
        rejectionIncidentCount: (lot.rejectionIncidentCount || 0) + 1,
      });

      // 4. Record disruption log
      const log: DisruptionLog = {
        id: `disrupt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: plan.disruptionType,
        description: plan.description,
        recoveryActionTaken: plan.explanation,
        recoveredVolumeDelta: plan.replacementItems.reduce((s, i) => s + i.volumeLiters, 0),
      };
      await db.disruptionLogs.add(log);
    });
  }
}
