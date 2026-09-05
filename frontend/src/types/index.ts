export type HazardClass =
  | 'Corrosive Acid'
  | 'Corrosive Base'
  | 'Flammable Liquid'
  | 'Oxidizer'
  | 'Toxic Heavy Metal'
  | 'Organic Peroxide'
  | 'Water Reactive';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'standard';

export type WasteStatus = 'available' | 'queued' | 'in_transit' | 'disposed' | 'rejected';

export type LabStatus = 'active' | 'pickup_ready' | 'offline_cached' | 'cancelled';

export interface Lab {
  id: string;
  code: string;
  name: string;
  facilityType: string;
  address: string;
  city: string;
  state: string;
  epaId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dockType: string;
  operationalStatus: LabStatus;
  activeDrumCount: number;
  totalVolumeGal: number;
  safetyAuditScore: number;
  lastInspectionDate: string;
  specialHandlingNotes?: string;
}

export interface WasteItem {
  id: string;
  trackingId: string;
  labId: string;
  labName: string;
  chemicalName: string;
  commonName: string;
  casNumber: string;
  hazardClass: HazardClass;
  epaWasteCode: string;
  dotProperShippingName: string;
  unNumber: string;
  containerType: '55-gal Poly Drum' | '55-gal Steel Drum' | '30-gal Poly Drum' | '30-gal Steel Drum' | '5-gal Safety Carboy' | '15-gal Poly Drum';
  volumeGal: number;
  weightLbs: number;
  ph?: number;
  flashPointF?: number;
  specificGravity?: number;
  urgency: UrgencyLevel;
  status: WasteStatus;
  storageBay: string;
  dateLogged: string;
  rejectionReason?: string;
  notes?: string;
}

export interface CompatibilityViolation {
  itemA: WasteItem;
  itemB: WasteItem;
  reason: string;
  reactionSeverity: 'CRITICAL_BLOCK' | 'WARNING';
  reactionConsequence: string;
  epaCitation: string;
  dotCitation: string;
}

export interface CompatibilityWarning {
  itemA: WasteItem;
  itemB: WasteItem;
  warningNote: string;
  segregationGroup: string;
}

export interface BatchCompatibilityReport {
  isSafe: boolean;
  violations: CompatibilityViolation[];
  warnings: CompatibilityWarning[];
  compatibleCount: number;
  totalPairsChecked: number;
  segregationGroups: Record<string, string[]>;
  timestamp: string;
}

export interface LabStop {
  labId: string;
  labName: string;
  city: string;
  address: string;
  dockType: string;
  itemCount: number;
  volumeGal: number;
  weightLbs: number;
  scheduledWindow: string;
}

export interface PoolingRun {
  id: string;
  runCode: string;
  scheduledDate: string;
  haulerName: string;
  haulerVehicleId: string;
  driverName: string;
  vehicleCapacityGal: number;
  currentVolumeGal: number;
  currentWeightLbs: number;
  utilizationPercent: number;
  status: 'optimizing' | 'scheduled' | 'in_transit' | 'completed' | 'rerouted';
  items: WasteItem[];
  stops: LabStop[];
  chemiGuardVerified: boolean;
  verificationHash: string;
  manifestNumber: string;
  tsdfFacility: string;
}

export interface CustodyEvent {
  id: string;
  timestamp: string;
  step: string;
  stepTitle?: string;
  location: string;
  actorName?: string;
  actorRole?: string;
  signedBy?: string;
  role?: string;
  digitalSignature: string;
  verified?: boolean;
  offlineGenerated?: boolean;
  isOfflineCreated?: boolean;
  syncStatus?: 'synced' | 'offline_queued';
  runId?: string;
  manifestNumber: string;
  notes?: string;
}

export interface ResilienceEvent {
  id: string;
  timestamp: string;
  type: 'lab_cancellation' | 'hauler_rejection' | 'route_recovery';
  title: string;
  affectedLabId?: string;
  affectedItemId?: string;
  volumeDeltaGal: number;
  rebalancedRunId: string;
  statusMessage: string;
  safetyPreserved: boolean;
}

export interface AIOperationsRecord {
  id: string;
  query: string;
  invokedEngine: 'ChemiGuard' | 'QuotaPacker' | 'ResilienceGuard' | 'CustodySentinel';
  invokedTool: string;
  deterministicResult: {
    status: 'PASS' | 'CRITICAL_BLOCK' | 'OPTIMIZED' | 'REBALANCED' | 'VERIFIED';
    summary: string;
    details: any;
  };
  explanation: string;
  timestamp: string;
}
