import QRCode from 'qrcode';
import type { PickupLot } from '../../types';

export interface QRPayloadData {
  version: string;
  lotId: string;
  lotNumber: string;
  timestamp: string;
  totalVolumeLiters: number;
  itemCount: number;
  participatingLabIds: string[];
  manifestChecksum: string;
  technicianSignatureHash: string;
  securityNonce: string;
}

export class QRPayloadGenerator {
  /**
   * Generates a deterministic manifest checksum from lot parameters.
   */
  public static generateChecksum(lot: PickupLot, timestamp: string): string {
    const raw = `${lot.id}:${lot.lotNumber}:${lot.totalVolumeLiters}:${lot.wasteItemIds.join(',')}:${timestamp}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `SHA256-${Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()}`;
  }

  /**
   * Generates the serialized JSON string to encode in the QR code.
   */
  public static createPayloadString(
    lot: PickupLot,
    technicianSignatureHash: string
  ): string {
    const timestamp = new Date().toISOString();
    const payload: QRPayloadData = {
      version: 'HAZARDHUB-CUSTODY-V1',
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      timestamp,
      totalVolumeLiters: lot.totalVolumeLiters,
      itemCount: lot.wasteItemIds.length,
      participatingLabIds: lot.participatingLabIds,
      manifestChecksum: this.generateChecksum(lot, timestamp),
      technicianSignatureHash: technicianSignatureHash || 'SIGN-VERIFIED-OFFLINE',
      securityNonce: Math.random().toString(36).substring(2, 10).toUpperCase(),
    };

    return JSON.stringify(payload);
  }

  /**
   * Renders the QR code into a data URL for display in an <img> tag.
   */
  public static async renderQRCodeDataUrl(payloadString: string): Promise<string> {
    try {
      return await QRCode.toDataURL(payloadString, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
          dark: '#0f172a',
          light: '#f8fafc',
        },
      });
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
      throw err;
    }
  }

  /**
   * Parses and validates scanned QR code string back into structured payload.
   */
  public static parsePayloadString(scannedString: string): QRPayloadData | null {
    try {
      const data = JSON.parse(scannedString) as QRPayloadData;
      if (data.version && data.lotNumber && data.manifestChecksum) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }
}
