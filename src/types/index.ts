export type UrgencyLevel = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ContainerCondition = 'GOOD' | 'DAMAGED' | 'LEAKING';

export type WasteStatus = 'AVAILABLE' | 'RESERVED' | 'IN_LOT' | 'QUARANTINED' | 'COLLECTED';

export type LotStatus = 'DRAFT' | 'READY_FOR_DISPATCH' | 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export type NetworkMode = 'ONLINE' | 'SPOTTY' | 'OFFLINE';

export type EPAGroup = 
  | 'GROUP_1A_ACIDS'
  | 'GROUP_1B_BASES'
  | 'GROUP_2A_ACIDS_REACTIVE'
  | 'GROUP_2B_CYANIDES_SULFIDES'
  | 'GROUP_3A_OXIDIZERS'
  | 'GROUP_3B_FLAMMABLES_ORGANIC'
  | 'GROUP_4A_HALOGENATED'
  | 'GROUP_4B_REACTIVE_METALS'
  | 'GROUP_5_BLEACH'
  | 'GROUP_5_AMMONIA';

export interface Lab {
  id: string;
  name: string;
  type: 'SCHOOL' | 'DENTAL' | 'PATHOLOGY' | 'WATER' | 'DERMATOLOGY' | 'VET' | 'FORENSIC' | 'INCUBATOR';
  contactPerson: string;
  phone: string;
  address: string;
  epaFacilityId: string;
  latitude: number;
  longitude: number;
  storageLocation: string;
  isParticipating: boolean;
}

export interface WasteItem {
  id: string;
  labId: string;
  name: string;
  chemicalFormula?: string;
  epaGroup: EPAGroup;
  dotClass: string; // e.g., "Class 8: Corrosive", "Class 3: Flammable Liquid"
  unCode: string; // e.g., "UN1760", "UN1993"
  volumeLiters: number;
  containerType: '5L Carboy' | '10L Carboy' | '20L Drum' | '2.5L Glass' | '1L Bottle';
  condition: ContainerCondition;
  urgency: UrgencyLevel;
  expirationDate: string;
  daysUntilExpiring: number;
  status: WasteStatus;
  notes?: string;
  assignedLotId?: string;
}

export interface IncompatibilityIssue {
  itemAId: string;
  itemAName: string;
  itemAGroup: EPAGroup;
  itemBId: string;
  itemBName: string;
  itemBGroup: EPAGroup;
  hazardDescription: string;
  consequence: 'EXPLOSION' | 'TOXIC_GAS' | 'CORROSIVE_SPATTER' | 'FIRE';
  remedyRecommendation: string;
}

export interface CompatibilityCheckResult {
  isSafe: boolean;
  issues: IncompatibilityIssue[];
  checkedCount: number;
}

export interface PickupLot {
  id: string;
  lotNumber: string; // e.g. "LOT-2026-0901"
  createdAt: string;
  scheduledDate: string;
  status: LotStatus;
  wasteItemIds: string[];
  totalVolumeLiters: number;
  targetThresholdLiters: number; // default 150
  reserveBufferLiters: number;
  isThresholdMet: boolean;
  participatingLabIds: string[];
  haulerName: string;
  haulerTruckPlate: string;
  haulerDriverName: string;
  standbyWasteItemIds: string[];
  rejectionIncidentCount: number;
}

export interface CustodyEvent {
  id: string;
  lotId: string;
  timestamp: string;
  actorName: string;
  actorRole: 'LAB_TECHNICIAN' | 'HAULER_DRIVER' | 'SYSTEM_AGENT';
  action: 'LOT_STAGED' | 'TECHNICIAN_SIGNED' | 'QR_HANDSHAKE_SCANNED' | 'DRIVER_ACCEPTED' | 'PICKUP_DISPATCHED' | 'CONTAINER_REJECTED';
  location: string;
  signatureDataUrl?: string;
  cryptographicHash: string;
  syncStatus: 'SYNCED' | 'PENDING_OFFLINE';
  details?: string;
}

export interface DisruptionLog {
  id: string;
  timestamp: string;
  type: 'LAB_CANCELLATION' | 'CONTAINER_REJECTED' | 'CONTAINER_DAMAGED' | 'NETWORK_DROP';
  description: string;
  recoveryActionTaken: string;
  recoveredVolumeDelta: number;
}
