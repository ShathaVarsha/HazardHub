"""
HazardHub Core Data Models & Type Definitions
Pure Python equivalent to src/types/index.ts
"""

from dataclasses import dataclass, field
from typing import Literal, Optional, List, Dict, Any


# ──────────────────────────────────────────
# Enumerations / Literal Types
# ──────────────────────────────────────────

UrgencyLevel = Literal['URGENT', 'HIGH', 'MEDIUM', 'LOW']

ContainerCondition = Literal['GOOD', 'DAMAGED', 'LEAKING']

WasteStatus = Literal['AVAILABLE', 'RESERVED', 'IN_LOT', 'QUARANTINED', 'COLLECTED']

LotStatus = Literal[
    'DRAFT', 'READY_FOR_DISPATCH', 'SCHEDULED',
    'IN_TRANSIT', 'COMPLETED', 'CANCELLED'
]

NetworkMode = Literal['ONLINE', 'SPOTTY', 'OFFLINE']

EPAGroup = Literal[
    'GROUP_1A_ACIDS',
    'GROUP_1B_BASES',
    'GROUP_2A_ACIDS_REACTIVE',
    'GROUP_2B_CYANIDES_SULFIDES',
    'GROUP_3A_OXIDIZERS',
    'GROUP_3B_FLAMMABLES_ORGANIC',
    'GROUP_4A_HALOGENATED',
    'GROUP_4B_REACTIVE_METALS',
    'GROUP_5_BLEACH',
    'GROUP_5_AMMONIA',
]

LabType = Literal[
    'SCHOOL', 'DENTAL', 'PATHOLOGY', 'WATER',
    'DERMATOLOGY', 'VET', 'FORENSIC', 'INCUBATOR'
]

ContainerType = Literal['5L Carboy', '10L Carboy', '20L Drum', '2.5L Glass', '1L Bottle']

Consequence = Literal['EXPLOSION', 'TOXIC_GAS', 'CORROSIVE_SPATTER', 'FIRE']

ActorRole = Literal['LAB_TECHNICIAN', 'HAULER_DRIVER', 'SYSTEM_AGENT']

CustodyAction = Literal[
    'LOT_STAGED', 'TECHNICIAN_SIGNED', 'QR_HANDSHAKE_SCANNED',
    'DRIVER_ACCEPTED', 'PICKUP_DISPATCHED', 'CONTAINER_REJECTED'
]

DisruptionType = Literal[
    'LAB_CANCELLATION', 'CONTAINER_REJECTED', 'CONTAINER_DAMAGED', 'NETWORK_DROP'
]


# ──────────────────────────────────────────
# Data Classes
# ──────────────────────────────────────────

@dataclass
class Lab:
    id: str
    name: str
    type: LabType
    contact_person: str
    phone: str
    address: str
    epa_facility_id: str
    latitude: float
    longitude: float
    storage_location: str
    is_participating: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'contact_person': self.contact_person,
            'phone': self.phone,
            'address': self.address,
            'epa_facility_id': self.epa_facility_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'storage_location': self.storage_location,
            'is_participating': self.is_participating,
        }

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> 'Lab':
        return cls(**d)


@dataclass
class WasteItem:
    id: str
    lab_id: str
    name: str
    epa_group: EPAGroup
    dot_class: str               # e.g. "Class 8: Corrosive"
    un_code: str                 # e.g. "UN1760"
    volume_liters: float
    container_type: ContainerType
    condition: ContainerCondition
    urgency: UrgencyLevel
    expiration_date: str         # ISO date string YYYY-MM-DD
    days_until_expiring: int
    status: WasteStatus
    chemical_formula: Optional[str] = None
    notes: Optional[str] = None
    assigned_lot_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'lab_id': self.lab_id,
            'name': self.name,
            'chemical_formula': self.chemical_formula,
            'epa_group': self.epa_group,
            'dot_class': self.dot_class,
            'un_code': self.un_code,
            'volume_liters': self.volume_liters,
            'container_type': self.container_type,
            'condition': self.condition,
            'urgency': self.urgency,
            'expiration_date': self.expiration_date,
            'days_until_expiring': self.days_until_expiring,
            'status': self.status,
            'notes': self.notes,
            'assigned_lot_id': self.assigned_lot_id,
        }

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> 'WasteItem':
        return cls(**d)


@dataclass
class IncompatibilityIssue:
    item_a_id: str
    item_a_name: str
    item_a_group: EPAGroup
    item_b_id: str
    item_b_name: str
    item_b_group: EPAGroup
    hazard_description: str
    consequence: Consequence
    remedy_recommendation: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            'item_a_id': self.item_a_id,
            'item_a_name': self.item_a_name,
            'item_a_group': self.item_a_group,
            'item_b_id': self.item_b_id,
            'item_b_name': self.item_b_name,
            'item_b_group': self.item_b_group,
            'hazard_description': self.hazard_description,
            'consequence': self.consequence,
            'remedy_recommendation': self.remedy_recommendation,
        }


@dataclass
class CompatibilityCheckResult:
    is_safe: bool
    issues: List[IncompatibilityIssue]
    checked_count: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            'is_safe': self.is_safe,
            'issues': [i.to_dict() for i in self.issues],
            'checked_count': self.checked_count,
        }


@dataclass
class ProposedLotBundle:
    selected_items: List[WasteItem]
    standby_reserve_items: List[WasteItem]
    total_volume_liters: float
    target_threshold_liters: float
    reserve_buffer_liters: float
    is_threshold_met: bool
    participating_lab_ids: List[str]
    compatibility: CompatibilityCheckResult
    urgency_breakdown: Dict[str, int]


@dataclass
class PickupLot:
    id: str
    lot_number: str              # e.g. "LOT-2026-0901"
    created_at: str
    scheduled_date: str
    status: LotStatus
    waste_item_ids: List[str]
    total_volume_liters: float
    target_threshold_liters: float  # default 150
    reserve_buffer_liters: float
    is_threshold_met: bool
    participating_lab_ids: List[str]
    hauler_name: str
    hauler_truck_plate: str
    hauler_driver_name: str
    standby_waste_item_ids: List[str] = field(default_factory=list)
    rejection_incident_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'lot_number': self.lot_number,
            'created_at': self.created_at,
            'scheduled_date': self.scheduled_date,
            'status': self.status,
            'waste_item_ids': self.waste_item_ids,
            'total_volume_liters': self.total_volume_liters,
            'target_threshold_liters': self.target_threshold_liters,
            'reserve_buffer_liters': self.reserve_buffer_liters,
            'is_threshold_met': self.is_threshold_met,
            'participating_lab_ids': self.participating_lab_ids,
            'hauler_name': self.hauler_name,
            'hauler_truck_plate': self.hauler_truck_plate,
            'hauler_driver_name': self.hauler_driver_name,
            'standby_waste_item_ids': self.standby_waste_item_ids,
            'rejection_incident_count': self.rejection_incident_count,
        }

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> 'PickupLot':
        return cls(**d)


@dataclass
class CustodyEvent:
    id: str
    lot_id: str
    timestamp: str
    actor_name: str
    actor_role: ActorRole
    action: CustodyAction
    location: str
    cryptographic_hash: str
    sync_status: Literal['SYNCED', 'PENDING_OFFLINE']
    signature_data_url: Optional[str] = None
    details: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'lot_id': self.lot_id,
            'timestamp': self.timestamp,
            'actor_name': self.actor_name,
            'actor_role': self.actor_role,
            'action': self.action,
            'location': self.location,
            'cryptographic_hash': self.cryptographic_hash,
            'sync_status': self.sync_status,
            'signature_data_url': self.signature_data_url,
            'details': self.details,
        }

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> 'CustodyEvent':
        return cls(**d)


@dataclass
class DisruptionLog:
    id: str
    timestamp: str
    type: DisruptionType
    description: str
    recovery_action_taken: str
    recovered_volume_delta: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'timestamp': self.timestamp,
            'type': self.type,
            'description': self.description,
            'recovery_action_taken': self.recovery_action_taken,
            'recovered_volume_delta': self.recovered_volume_delta,
        }

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> 'DisruptionLog':
        return cls(**d)


@dataclass
class RecoveryPlan:
    lot_id: str
    disruption_type: DisruptionType
    description: str
    affected_volume_liters: float
    remaining_volume_before_recovery: float
    threshold_liters: float
    is_below_threshold: bool
    can_be_fully_restored: bool
    replacement_item_ids: List[str]
    replacement_items: List[WasteItem]
    new_projected_volume: float
    explanation: str
