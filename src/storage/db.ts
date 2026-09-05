import Dexie, { type Table } from 'dexie';
import type { Lab, WasteItem, PickupLot, CustodyEvent, DisruptionLog } from '../types';
import { SEEDED_LABS } from '../data/labs';
import { SEEDED_WASTE_ITEMS } from '../data/waste';

export class HazardHubDB extends Dexie {
  labs!: Table<Lab, string>;
  wasteItems!: Table<WasteItem, string>;
  pickupLots!: Table<PickupLot, string>;
  custodyEvents!: Table<CustodyEvent, string>;
  disruptionLogs!: Table<DisruptionLog, string>;

  constructor() {
    super('HazardHubDatabase');
    this.version(1).stores({
      labs: 'id, name, type, epaFacilityId, isParticipating',
      wasteItems: 'id, labId, epaGroup, status, urgency, condition, assignedLotId',
      pickupLots: 'id, lotNumber, status, isThresholdMet',
      custodyEvents: 'id, lotId, timestamp, action, syncStatus',
      disruptionLogs: 'id, timestamp, type',
    });
  }

  async seedIfEmpty(): Promise<void> {
    const labCount = await this.labs.count();
    if (labCount === 0) {
      console.log('Seeding initial 8 laboratories...');
      await this.labs.bulkAdd(SEEDED_LABS);
    }

    const wasteCount = await this.wasteItems.count();
    if (wasteCount === 0) {
      console.log('Seeding initial 28+ hazardous waste containers...');
      await this.wasteItems.bulkAdd(SEEDED_WASTE_ITEMS);
    }
  }

  async resetToDefaults(): Promise<void> {
    await this.transaction('rw', [this.labs, this.wasteItems, this.pickupLots, this.custodyEvents, this.disruptionLogs], async () => {
      await this.labs.clear();
      await this.wasteItems.clear();
      await this.pickupLots.clear();
      await this.custodyEvents.clear();
      await this.disruptionLogs.clear();

      await this.labs.bulkAdd(SEEDED_LABS);
      await this.wasteItems.bulkAdd(SEEDED_WASTE_ITEMS);
    });
  }
}

export const db = new HazardHubDB();

// Auto-seed on initial module execution
db.seedIfEmpty().catch((err) => {
  console.error('Failed to initialize HazardHub IndexedDB:', err);
});
