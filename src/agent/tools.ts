import { db } from '../storage/db';
import { ChemiGuardEngine } from '../engines/chemiguard/chemiguard';
import { QuotaPackerEngine } from '../engines/quotapacker/quotapacker';

export interface ToolExecutionResult {
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  summary: string;
}

export class OperationsAgentTools {
  /**
   * Tool: inspectUrgentWaste
   * Retrieves all waste items nearing their expiration date.
   */
  public static async inspectUrgentWaste(daysLimit: number = 14): Promise<ToolExecutionResult> {
    const allWaste = await db.wasteItems.toArray();
    const urgent = allWaste.filter(
      (w) => (w.status === 'AVAILABLE' || w.status === 'RESERVED') && w.daysUntilExpiring <= daysLimit
    );

    urgent.sort((a, b) => a.daysUntilExpiring - b.daysUntilExpiring);

    return {
      toolName: 'inspectUrgentWaste',
      parameters: { daysLimit },
      result: urgent,
      summary: `Found ${urgent.length} urgent container(s) expiring within ${daysLimit} days totaling ${urgent.reduce((s, w) => s + w.volumeLiters, 0).toFixed(1)} Liters.`,
    };
  }

  /**
   * Tool: checkCompatibility
   * Evaluates pairwise safety for a list of chemical names or IDs.
   */
  public static async checkCompatibility(itemIds: string[]): Promise<ToolExecutionResult> {
    const allWaste = await db.wasteItems.toArray();
    const targetItems = allWaste.filter((w) => itemIds.includes(w.id));

    const check = ChemiGuardEngine.evaluateLot(targetItems);

    return {
      toolName: 'checkCompatibility',
      parameters: { itemIds, chemicalNames: targetItems.map((i) => i.name) },
      result: check,
      summary: check.isSafe
        ? `ChemiGuard verified ${check.checkedCount} pairs: 100% EPA Safe. No reactive hazards.`
        : `ChemiGuard detected ${check.issues.length} violation(s)! Primary risk: ${check.issues[0]?.hazardDescription}.`,
    };
  }

  /**
   * Tool: proposeOptimalLot
   * Runs the QuotaPacker Knapsack optimizer to form a >=150L lot.
   */
  public static async proposeOptimalLot(minThreshold: number = 150): Promise<ToolExecutionResult> {
    const allWaste = await db.wasteItems.toArray();
    const eligible = allWaste.filter((w) => w.status === 'AVAILABLE' && w.condition !== 'LEAKING');

    const bundle = QuotaPackerEngine.autoBundle(eligible, {
      minThresholdLiters: minThreshold,
      reserveBufferPercent: 15,
    });

    return {
      toolName: 'proposeOptimalLot',
      parameters: { minThreshold, bufferTarget: minThreshold * 1.15 },
      result: bundle,
      summary: bundle.isThresholdMet
        ? `Successfully assembled ${bundle.totalVolumeLiters.toFixed(1)} L across ${bundle.participatingLabIds.length} labs with ${bundle.standbyReserveItems.length} standby reserve containers. 100% EPA Compatible.`
        : `Available pool has ${bundle.totalVolumeLiters.toFixed(1)} L, which is ${(minThreshold - bundle.totalVolumeLiters).toFixed(1)} L short of the ${minThreshold} L quota.`,
    };
  }

  /**
   * Tool: queryReadiness
   * Summarizes regional readiness across all 8 labs.
   */
  public static async queryReadiness(): Promise<ToolExecutionResult> {
    const labs = await db.labs.toArray();
    const waste = await db.wasteItems.toArray();
    const lots = await db.pickupLots.toArray();

    const activeWaste = waste.filter((w) => w.status === 'AVAILABLE');
    const totalVolume = activeWaste.reduce((s, w) => s + w.volumeLiters, 0);
    const urgentCount = activeWaste.filter((w) => w.urgency === 'URGENT').length;

    return {
      toolName: 'queryReadiness',
      parameters: {},
      result: { totalVolume, urgentCount, labCount: labs.length, lotCount: lots.length },
      summary: `Regional Pool: ${totalVolume.toFixed(1)} L ready waste across ${labs.length} laboratories. ${urgentCount} urgent items. ${lots.length} active pickup lots.`,
    };
  }
}
