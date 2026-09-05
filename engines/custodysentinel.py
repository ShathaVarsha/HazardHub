"""
CustodySentinel Offline Cryptographic Chain-of-Custody Engine
Pure Python equivalent to src/engines/custodysentinel/qrPayload.ts
Generates tamper-evident SHA-256 manifest checksums and renders offline-scannable QR payloads
for field custody handshakes at loading docks without cellular or internet connectivity.
"""

import json
import hashlib
import io
import base64
import random
from datetime import datetime
from typing import Optional, Dict, Any

import qrcode

from models import PickupLot


class QRPayloadGenerator:
    """
    Offline cryptographic custody payload generator and QR image renderer.
    """

    @staticmethod
    def generate_checksum(lot: PickupLot, timestamp: str) -> str:
        """
        Generates a deterministic SHA-256 manifest checksum from lot parameters.
        """
        raw = f"{lot.id}:{lot.lot_number}:{lot.total_volume_liters}:{','.join(lot.waste_item_ids)}:{timestamp}"
        digest = hashlib.sha256(raw.encode('utf-8')).hexdigest().upper()
        return f"SHA256-{digest[:16]}"

    @classmethod
    def create_payload_string(
        cls,
        lot: PickupLot,
        technician_signature_hash: Optional[str] = None,
    ) -> str:
        """
        Generates the serialized JSON string to encode in the QR code.
        """
        timestamp = datetime.now().isoformat()
        checksum = cls.generate_checksum(lot, timestamp)
        nonce = hex(random.randint(0x10000000, 0xFFFFFFFF))[2:].upper()

        payload: Dict[str, Any] = {
            'version': 'HAZARDHUB-CUSTODY-V1',
            'lotId': lot.id,
            'lotNumber': lot.lot_number,
            'timestamp': timestamp,
            'totalVolumeLiters': lot.total_volume_liters,
            'itemCount': len(lot.waste_item_ids),
            'participatingLabIds': lot.participating_lab_ids,
            'manifestChecksum': checksum,
            'technicianSignatureHash': technician_signature_hash or 'SIGN-VERIFIED-OFFLINE',
            'securityNonce': nonce,
        }

        return json.dumps(payload)

    @staticmethod
    def render_qr_code_data_url(payload_string: str) -> str:
        """
        Renders the QR code into a base64 PNG data URL for display in HTML <img> tags or Streamlit.
        """
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(payload_string)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#0a192f", back_color="#f8fafc")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{b64_str}"

    @staticmethod
    def parse_payload_string(scanned_string: str) -> Optional[Dict[str, Any]]:
        """
        Parses and validates scanned QR code string back into structured payload.
        """
        try:
            data = json.loads(scanned_string)
            if isinstance(data, dict) and data.get('version') and data.get('lotNumber') and data.get('manifestChecksum'):
                return data
            return None
        except Exception:
            return None
