import type { WasteItem, PickupLot, CompatibilityCheckResult } from '../../types';
import { ChemiGuardEngine } from '../chemiguard/chemiguard';

export interface AutoBundleOptions {
  minThresholdLiters?: number;
  reserveBufferPercent?: number; // e.g. 15% -> target is 150 * 1.15 = 172.5L
  preferredLabIds?: string[];
  maxStops?: number;
}

export interface ProposedLotBundle {
  selectedItems: WasteItem[];
  standbyReserveItems: WasteItem[];
  totalVolumeLiters: number;
  targetThresholdLiters: number;
  reserveBufferLiters: number;
  isThresholdMet: boolean;
  participatingLabIds: string[];
  compatibility: CompatibilityCheckResult;
  urgencyBreakdown: {
    urgentCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

export class QuotaPackerEngine {
  public static readonly DEFAULT_MIN_THRESHOLD = 150.0;
  public static readonly DEFAULT_BUFFER_PERCENT = 15.0; // 15% safety margin

  /**
   * 1-Click Auto-Bundle heuristic:
   * Greedily bundles compatible waste prioritizing expiring urgent containers
   * until the threshold + reserve buffer is met.
   */
  public static autoBundle(
    availablePool: WasteItem[],
    options: AutoBundleOptions = {}
  ): ProposedLotBundle {
    const minThreshold = options.minThresholdLiters ?? this.DEFAULT_MIN_THRESHOLD;
    const bufferPercent = options.reserveBufferPercent ?? this.DEFAULT_BUFFER_PERCENT;
    const targetWithBuffer = minThreshold * (1 + bufferPercent / 100);

    // 1. Filter out already assigned or leaking containers
    const eligiblePool = availablePool.filter(
      (item) => item.status === 'AVAILABLE' && item.condition !== 'LEAKING'
    );

    // 2. Sort pool by urgency priority: URGENT (4) > HIGH (3) > MEDIUM (2) > LOW (1)
    const urgencyWeights: Record<string, number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const sortedCandidates = [...eligiblePool].sort((a, b) => {
      const weightDiff = (urgencyWeights[b.urgency] || 0) - (urgencyWeights[a.urgency] || 0);
      if (weightDiff !== 0) return weightDiff;
      // Secondary sort: Days until expiring (ascending)
      return a.daysUntilExpiring - b.daysUntilExpiring;
    });

    // 3. Greedily assemble compatible cluster
    const selected: WasteItem[] = [];
    let accumulatedVolume = 0;

    for (const candidate of sortedCandidates) {
      // Check pairwise compatibility against all already selected items
      const isCompatible = selected.every(
        (existing) => ChemiGuardEngine.checkPair(candidate, existing) === null
      );

      if (isCompatible) {
        selected.push(candidate);
        accumulatedVolume += candidate.volumeLiters;

        // If target with safety buffer is met, stop core selection
        if (accumulatedVolume >= targetWithBuffer) {
          break;
        }
      }
    }

    // 4. Identify 1-2 Standby Reserve candidates from remaining pool
    // Standby containers stay in reserve to protect against last-minute cancellations
    const remainingPool = sortedCandidates.filter(
      (c) => !selected.some((s) => s.id === c.id)
    );

    const standbyReserves: WasteItem[] = [];
    for (const candidate of remainingPool) {
      // Must be compatible with the selected lot
      const isCompatibleWithLot = selected.every(
        (s) => ChemiGuardEngine.checkPair(candidate, s) === null
      );
      if (isCompatibleWithLot) {
        standbyReserves.push(candidate);
        if (standbyReserves.length >= 2) break;
      }
    }

    // 5. Build proposal output
    const participatingLabs = Array.from(new Set(selected.map((i) => i.labId)));
    const compatibility = ChemiGuardEngine.evaluateLot(selected);

    return {
      selectedItems: selected,
      standbyReserveItems: standbyReserves,
      totalVolumeLiters: accumulatedVolume,
      targetThresholdLiters: minThreshold,
      reserveBufferLiters: Math.max(0, accumulatedVolume - minThreshold),
      isThresholdMet: accumulatedVolume >= minThreshold,
      participatingLabIds: participatingLabs,
      compatibility,
      urgencyBreakdown: {
        urgentCount: selected.filter((i) => i.urgency === 'URGENT').length,
        highCount: selected.filter((i) => i.urgency === 'HIGH').length,
        mediumCount: selected.filter((i) => i.urgency === 'MEDIUM').length,
        lowCount: selected.filter((i) => i.urgency === 'LOW').length,
      },
    };
  }

  /**
   * Helper to format a confirmed bundle into a formal PickupLot entity
   */
  public static createLotRecord(bundle: ProposedLotBundle, lotNumber?: string): PickupLot {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedNumber = lotNumber || `LOT-${timestamp}-${randomSuffix}`;

    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + 2); // 48h dispatch window

    return {
      id: `lot-${Date.now()}`,
      lotNumber: generatedNumber,
      createdAt: new Date().toISOString(),
      scheduledDate: scheduled.toISOString().slice(0, 10),
      status: 'SCHEDULED',
      wasteItemIds: bundle.selectedItems.map((i) => i.id),
      totalVolumeLiters: bundle.totalVolumeLiters,
      targetThresholdLiters: bundle.targetThresholdLiters,
      reserveBufferLiters: bundle.reserveBufferLiters,
      isThresholdMet: bundle.isThresholdMet,
      participatingLabIds: bundle.participatingLabIds,
      haulerName: 'CleanHarbors Regional Environmental Logistics',
      haulerTruckPlate: 'MA-COMM-8924',
      haulerDriverName: 'Officer Daniel Vance (CDL Hazmat Certified)',
      standbyWasteItemIds: bundle.standbyReserveItems.map((i) => i.id),
      rejectionIncidentCount: 0,
    };
  }
}
