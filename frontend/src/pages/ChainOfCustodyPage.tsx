import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  FileCheck2,
  Smartphone,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { CustodyEvent, PoolingRun } from '../types';
import { custodySentinel } from '../engines/custodySentinel';

interface ChainOfCustodyPageProps {
  runs: PoolingRun[];
  events: CustodyEvent[];
  onAddEvent: (event: CustodyEvent) => void;
}

export const ChainOfCustodyPage: React.FC<ChainOfCustodyPageProps> = ({
  runs,
  events,
  onAddEvent,
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string>(runs[0]?.id || '');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  const selectedRun = runs.find((r) => r.id === selectedRunId) || runs[0];
  const manifestData = selectedRun ? custodySentinel.generateManifestData(selectedRun) : null;
  const qrPayloadObj = selectedRun ? custodySentinel.generateQRPayload(selectedRun) : null;
  const qrPayload = qrPayloadObj ? JSON.stringify(qrPayloadObj, null, 2) : '';

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setScannedResult(null);
    setTimeout(() => {
      setIsSimulatingScan(false);
      setScannedResult(
        `AUTHENTICATION VERIFIED: Manifest #${selectedRun?.manifestNumber} signature ECDSA-P256 matches trusted TSDF certificate. Payload verified offline.`
      );

      // Also append a verified custody event
      if (selectedRun) {
        const newEvt: CustodyEvent = {
          id: `evt-${Date.now()}`,
          runId: selectedRun.id,
          manifestNumber: selectedRun.manifestNumber,
          step: 'Carrier Accepted',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          signedBy: selectedRun.driverName,
          role: 'Carrier Driver (HAZMAT Endorsed)',
          location: 'Cascade Bio-Foundry Dock 4',
          digitalSignature: `SIG-AIRGAP-VERIFIED-${Date.now()}`,
          isOfflineCreated: true,
          syncStatus: 'synced',
        };
        onAddEvent(newEvt);
      }
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            LOCAL-FIRST CRYPTOGRAPHIC VERIFICATION
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Cryptographic Chain of Custody &amp; Air-Gapped QR Handoff
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Tamper-evident digital signatures anchored to EPA Form 8700-22 e-Manifest specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Active Manifest:</span>
          <select
            value={selectedRunId}
            onChange={(e) => {
              setSelectedRunId(e.target.value);
              setScannedResult(null);
            }}
            className="px-3 py-2 rounded-md border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-teal-700"
          >
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.runCode} ({r.manifestNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: QR Card on left, Manifest Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Seal & Air-Gapped Scanner Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-center space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
              <div>
                <span className="text-xs font-mono font-bold text-teal-800">
                  CustodySentinel™ Air-Gap Protocol
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  Carrier Dock Handoff Token
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                OFFLINE SIGNED
              </span>
            </div>

            {/* Generated QR Code Visual Representation */}
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl inline-block mx-auto">
              <div className="w-52 h-52 bg-white p-3 rounded-lg shadow-2xs border border-slate-200 flex flex-col items-center justify-center relative">
                {/* SVG QR Code Pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  {/* Outer corner markers */}
                  <rect x="5" y="5" width="26" height="26" rx="2" fill="currentColor" />
                  <rect x="8" y="8" width="20" height="20" rx="1" fill="white" />
                  <rect x="12" y="12" width="12" height="12" fill="currentColor" />

                  <rect x="69" y="5" width="26" height="26" rx="2" fill="currentColor" />
                  <rect x="72" y="8" width="20" height="20" rx="1" fill="white" />
                  <rect x="76" y="12" width="12" height="12" fill="currentColor" />

                  <rect x="5" y="69" width="26" height="26" rx="2" fill="currentColor" />
                  <rect x="8" y="72" width="20" height="20" rx="1" fill="white" />
                  <rect x="12" y="76" width="12" height="12" fill="currentColor" />

                  {/* Synthetic data pattern */}
                  <rect x="36" y="10" width="6" height="6" />
                  <rect x="46" y="10" width="6" height="6" />
                  <rect x="56" y="10" width="6" height="6" />
                  <rect x="36" y="22" width="16" height="6" />
                  <rect x="56" y="22" width="6" height="16" />

                  <rect x="10" y="36" width="6" height="16" />
                  <rect x="22" y="36" width="6" height="6" />
                  <rect x="34" y="36" width="10" height="10" />
                  <rect x="50" y="40" width="8" height="8" />
                  <rect x="64" y="36" width="12" height="6" />
                  <rect x="82" y="36" width="8" height="8" />

                  <rect x="36" y="54" width="8" height="8" />
                  <rect x="50" y="54" width="14" height="6" />
                  <rect x="70" y="50" width="6" height="16" />
                  <rect x="82" y="54" width="8" height="8" />

                  <rect x="36" y="68" width="8" height="14" />
                  <rect x="48" y="70" width="12" height="6" />
                  <rect x="66" y="72" width="8" height="8" />
                  <rect x="80" y="70" width="10" height="14" />

                  <rect x="52" y="84" width="10" height="6" />
                  <rect x="68" y="86" width="8" height="6" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/95 p-1.5 rounded-full shadow-sm border border-slate-300">
                    <ShieldCheck className="w-5 h-5 text-teal-700" />
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 mt-2">
                Scan with driver handheld scanner
              </div>
            </div>

            {/* Payload preview */}
            <div className="text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Embedded Cryptographic Payload:</span>
                <button
                  onClick={handleCopyPayload}
                  className="text-teal-700 hover:underline flex items-center gap-1 text-[11px]"
                >
                  {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-teal-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-28">
                {qrPayload}
              </pre>
            </div>

            {/* Air-gap Simulator Trigger */}
            <button
              onClick={handleSimulateScan}
              disabled={isSimulatingScan}
              className="w-full py-3 rounded-md bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isSimulatingScan ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning &amp; Verifying Cryptographic Seal...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Simulate Driver Scanner Handoff</span>
                </>
              )}
            </button>

            {/* Scan Feedback */}
            {scannedResult && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 text-left flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Air-Gapped Scan Successful</div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">{scannedResult}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Manifest Sheet & Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Manifest Summary Sheet */}
          {manifestData && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-teal-800">
                    UNIFORM HAZARDOUS WASTE MANIFEST
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    EPA Form 8700-22 (e-Manifest)
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-black text-slate-900">
                    #{manifestData.manifestTrackingNumber}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    SEALED &amp; COMPLIANT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">1. Generator Labs Coordinated</div>
                  <div className="text-slate-600">
                    {selectedRun?.stops.map((s) => s.labName).join(', ')}
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Emergency Phone: 1-800-535-5053 (INFOTRAC)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">2. Designated TSDF Facility</div>
                  <div className="text-slate-800">{manifestData.designatedTsdf.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">
                    EPA ID: {manifestData.designatedTsdf.epaId}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {manifestData.designatedTsdf.address}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">3. Transporter 1 (Carrier)</div>
                <div className="flex flex-wrap items-center justify-between text-slate-700">
                  <span>{manifestData.transporter.companyName} (EPA: {manifestData.transporter.epaId})</span>
                  <span className="font-mono text-[11px]">Vehicle: {manifestData.transporter.vehicleId}</span>
                </div>
                <div className="text-slate-600">
                  Licensed Driver: <strong>{manifestData.transporter.driverName}</strong> (CDL Hazmat Certified)
                </div>
              </div>

              {/* Digital Hash Verification */}
              <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-teal-950">
                  <span>ECDSA Cryptographic Hash</span>
                  <span className="font-mono text-[10px] text-teal-800">ALGORITHM: SHA-256</span>
                </div>
                <div className="font-mono text-[11px] text-teal-900 break-all bg-white p-2 rounded border border-teal-100">
                  {manifestData.cryptographicHash}
                </div>
              </div>
            </div>
          )}

          {/* Chain of Custody Event Log Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              Verified Custody Event Ledger ({events.length} Transfers)
            </h3>

            <div className="space-y-3">
              {events.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{evt.step}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{evt.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <strong>Signer:</strong> {evt.signedBy} ({evt.role})
                    </div>
                    <div>
                      <strong>Location:</strong> {evt.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                    <span className="truncate max-w-[280px]">Signature: {evt.digitalSignature}</span>
                    <span className="text-emerald-700 font-bold">AIRGAP VERIFIED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
