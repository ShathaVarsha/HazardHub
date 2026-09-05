import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/db';
import { useAppStore } from '../store/useAppStore';
import { QRPayloadGenerator, type QRPayloadData } from '../engines/custodysentinel/qrPayload';
import { SignaturePad } from '../components/common/SignaturePad';
import type { CustodyEvent } from '../types';
import { 
  FileCheck2, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  WifiOff, 
  Wifi, 
  Truck, 
  ScanLine, 
  Lock
} from 'lucide-react';

export const CustodySignOff: React.FC = () => {
  const { selectedLotId, setSelectedLotId, networkMode, addToast } = useAppStore();

  const lots = useLiveQuery(() => db.pickupLots.toArray()) || [];
  const custodyEvents = useLiveQuery(() => db.custodyEvents.reverse().sortBy('timestamp')) || [];

  // Active lot
  const activeLot = lots.find((l) => l.id === selectedLotId) || lots[0] || null;

  // Signatures
  const [techSignature, setTechSignature] = useState<string>('');
  const [driverSignature, setDriverSignature] = useState<string>('');

  // Generated QR data URL
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrPayloadString, setQrPayloadString] = useState<string | null>(null);

  // Scanned driver data
  const [scannedData, setScannedData] = useState<QRPayloadData | null>(null);
  const [isHandoffComplete, setIsHandoffComplete] = useState<boolean>(false);

  // Generate QR when technician signs
  const handleGenerateQRPayload = async () => {
    if (!activeLot) return;
    if (!techSignature) {
      addToast('warning', 'Lab technician signature is required before generating handoff payload.');
      return;
    }

    const payloadStr = QRPayloadGenerator.createPayloadString(activeLot, 'SIG-HASH-VANCE-904');
    const dataUrl = await QRPayloadGenerator.renderQRCodeDataUrl(payloadStr);

    setQrPayloadString(payloadStr);
    setQrCodeDataUrl(dataUrl);

    // Record technician verification event in IndexedDB
    const techEvent: CustodyEvent = {
      id: `custody-${Date.now()}`,
      lotId: activeLot.id,
      timestamp: new Date().toISOString(),
      actorName: 'Dr. Eleanor Vance (Lead Technician)',
      actorRole: 'LAB_TECHNICIAN',
      action: 'TECHNICIAN_SIGNED',
      location: 'Oakridge Science Wing Loading Bay #1',
      signatureDataUrl: techSignature,
      cryptographicHash: QRPayloadGenerator.generateChecksum(activeLot, new Date().toISOString()),
      syncStatus: networkMode === 'OFFLINE' ? 'PENDING_OFFLINE' : 'SYNCED',
      details: `Technician verified ${activeLot.wasteItemIds.length} containers (${activeLot.totalVolumeLiters.toFixed(1)}L). Generated offline QR payload.`,
    };

    await db.custodyEvents.add(techEvent);
    addToast(
      networkMode === 'OFFLINE' ? 'warning' : 'success',
      networkMode === 'OFFLINE'
        ? 'Technician handoff recorded OFFLINE in IndexedDB (Queued for sync).'
        : 'Technician verified & signed! QR payload ready for hauler scan.'
    );
  };

  // Simulate Driver Scanning the QR Code
  const handleSimulateDriverScan = () => {
    if (!qrPayloadString) {
      addToast('error', 'Generate the technician QR payload first.');
      return;
    }

    const parsed = QRPayloadGenerator.parsePayloadString(qrPayloadString);
    if (parsed) {
      setScannedData(parsed);
      addToast('success', `Driver phone camera scanned QR Code! Verified Checksum: ${parsed.manifestChecksum}`);
    }
  };

  // Driver Final Acceptance
  const handleDriverFinalize = async () => {
    if (!activeLot || !scannedData) return;
    if (!driverSignature) {
      addToast('warning', 'Driver signature is required to accept legal custody.');
      return;
    }

    const driverEvent: CustodyEvent = {
      id: `custody-${Date.now()}-driver`,
      lotId: activeLot.id,
      timestamp: new Date().toISOString(),
      actorName: activeLot.haulerDriverName,
      actorRole: 'HAULER_DRIVER',
      action: 'DRIVER_ACCEPTED',
      location: 'Oakridge Loading Bay Dock (In Transit)',
      signatureDataUrl: driverSignature,
      cryptographicHash: scannedData.manifestChecksum,
      syncStatus: networkMode === 'OFFLINE' ? 'PENDING_OFFLINE' : 'SYNCED',
      details: `Driver verified seal & accepted ${scannedData.itemCount} containers. Truck departed.`,
    };

    await db.custodyEvents.add(driverEvent);

    // Update lot status to IN_TRANSIT
    await db.pickupLots.update(activeLot.id, {
      status: 'IN_TRANSIT',
    });

    setIsHandoffComplete(true);
    addToast(
      networkMode === 'OFFLINE' ? 'warning' : 'success',
      networkMode === 'OFFLINE'
        ? 'Handoff complete! All records secured in local IndexedDB. Will sync when network returns.'
        : 'Chain-of-Custody Complete: Physical handoff verified and registered.'
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              Chain-of-Custody Handshake
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5]">
              Offline Dual-Key PWA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cryptographic peer-to-peer verification between facility technicians and licensed hazardous waste transporters in zero-connectivity basement docks.
          </p>
        </div>

        {/* Network status pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              networkMode === 'OFFLINE'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {networkMode === 'OFFLINE' ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>OFFLINE LOCAL MODE</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>ONLINE CLOUD MESH ACTIVE</span>
              </>
            )}
          </div>
        </div>
      </div>

      {!activeLot ? (
        <div className="p-12 rounded-3xl border border-slate-200 bg-white text-center space-y-3.5 shadow-sm">
          <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Active Pickup Lot to Sign Off</h3>
            <p className="text-xs text-slate-500">Please bundle and finalize a pickup lot first using the Pickup Builder.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Lot Selector Header */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Target Staged Manifest</span>
                <span className="font-mono font-extrabold text-slate-900 text-base sm:text-lg">
                  {activeLot.lotNumber} ({activeLot.totalVolumeLiters.toFixed(1)} L)
                </span>
              </div>
            </div>

            {lots.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Switch Lot:</span>
                <select
                  value={activeLot.id}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>{l.lotNumber} - {l.totalVolumeLiters.toFixed(1)}L</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Dual Perspective Field Handoff Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: Lab Technician Sign-Off & QR Generation */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-mono font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Lab Technician Verification</h3>
                  <p className="text-[11px] text-slate-500">Inspect chemical containers and generate cryptographic handoff payload</p>
                </div>
              </div>

              {/* Verified Container summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Containers Verified:</span>
                  <strong className="text-slate-900 font-mono">{activeLot.wasteItemIds.length} Canisters</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Net Volume:</span>
                  <strong className="text-teal-700 font-mono font-bold">{activeLot.totalVolumeLiters.toFixed(1)} Liters</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">EPA Compliance:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% EPA 40 CFR Appendix V
                  </span>
                </div>
              </div>

              {/* Technician Signature Pad */}
              <SignaturePad
                label="Lab Technician Digital Signature"
                signeeName="Dr. Eleanor Vance"
                role="Regional Lead Safety Officer"
                onSaveSignature={setTechSignature}
              />

              {/* Generate QR Button */}
              <button
                onClick={handleGenerateQRPayload}
                disabled={!techSignature}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  techSignature
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Generate Offline Cryptographic QR Payload</span>
              </button>

              {/* Generated QR Display */}
              {qrCodeDataUrl && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2.5 animate-fade-in shadow-xs">
                  <div className="inline-block p-3 rounded-2xl bg-white shadow-md border border-slate-200">
                    <img src={qrCodeDataUrl} alt="Handoff QR" className="w-44 h-44 mx-auto" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-teal-800">
                      TOKEN: {QRPayloadGenerator.generateChecksum(activeLot, new Date().toISOString())}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Display this air-gapped QR code to the driver at the loading dock. Works completely offline.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Certified Hazmat Driver Verification */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hazmat Hauler Driver Sign-Off</h3>
                  <p className="text-[11px] text-slate-500">Scan optical payload, inspect seal integrity, and accept legal transfer</p>
                </div>
              </div>

              {/* Driver Optical Scan Simulation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
                <p className="text-xs text-slate-600">
                  Driver handheld terminal scans the technician's QR payload offline:
                </p>
                <button
                  onClick={handleSimulateDriverScan}
                  disabled={!qrCodeDataUrl}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer ${
                    qrCodeDataUrl
                      ? 'bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <ScanLine className="w-4 h-4 text-teal-600" />
                  <span>Simulate Driver Terminal QR Scan</span>
                </button>
              </div>

              {/* Verified Scanned Details */}
              {scannedData && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic Verification Succeeded</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-mono bg-white p-3 rounded-xl border border-emerald-100">
                    <div>Manifest: <strong className="text-slate-900">{scannedData.lotNumber}</strong></div>
                    <div>Volume: <strong className="text-teal-700 font-bold">{scannedData.totalVolumeLiters.toFixed(1)} L</strong></div>
                    <div>Containers: <strong className="text-slate-900">{scannedData.itemCount}</strong></div>
                    <div>Nonce: <span className="text-slate-500">{scannedData.securityNonce}</span></div>
                  </div>
                </div>
              )}

              {/* Driver Signature Pad */}
              <SignaturePad
                label="Hazmat Driver Legal Signature"
                signeeName={activeLot.haulerDriverName}
                role="Certified CDL Hazmat Operator"
                onSaveSignature={setDriverSignature}
              />

              {/* Driver Finalize Button */}
              <button
                onClick={handleDriverFinalize}
                disabled={!scannedData || !driverSignature || isHandoffComplete}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  scannedData && driverSignature && !isHandoffComplete
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHandoffComplete ? '✓ Legal Custody Transferred (In Transit)' : 'Accept Legal Custody & Seal Truck'}</span>
              </button>
            </div>
          </div>

          {/* Immutable Chain-of-Custody Event Timeline */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Immutable Chain-of-Custody Audit Trail</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                {custodyEvents.length} Cryptographic Handshakes
              </span>
            </div>

            {custodyEvents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No handoff events recorded yet. Complete the technician and driver sign-off above to record tamper-proof audit events.
              </p>
            ) : (
              <div className="space-y-3">
                {custodyEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900 font-mono">{evt.action}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                            evt.syncStatus === 'SYNCED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                          }`}
                        >
                          {evt.syncStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{evt.details}</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                        <span>Actor: {evt.actorName} ({evt.actorRole})</span>
                        <span>•</span>
                        <span>Location: {evt.location}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-[10px] font-mono text-teal-700 font-semibold">
                        {evt.cryptographicHash}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
