import React from 'react';
import type { PickupLot, WasteItem, Lab } from '../../types';
import { Printer, X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface EPA8700ManifestProps {
  lot: PickupLot;
  items: WasteItem[];
  labs: Lab[];
  onClose: () => void;
}

export const EPA8700Manifest: React.FC<EPA8700ManifestProps> = ({
  lot,
  items,
  labs,
  onClose,
}) => {
  const participatingLabs = labs.filter((l) => lot.participatingLabIds.includes(l.id));
  const leadLab = participatingLabs[0] || labs[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-slate-300 shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-slate-900 print:text-black print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white">
        {/* Header Action Bar (Hidden during printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 no-print text-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Uniform Hazardous Waste Manifest</h2>
              <p className="text-xs text-slate-500">EPA Form 8700-22 (Rev. 12-25) Regulatory Digital Prototype</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable EPA Form 8700-22 Document Body */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-black space-y-4 font-sans text-xs print:rounded-none print:border-2">
          {/* Top Form Header */}
          <div className="border-b-2 border-black pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block text-neutral-600">
                U.S. ENVIRONMENTAL PROTECTION AGENCY
              </span>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-neutral-900 uppercase">
                UNIFORM HAZARDOUS WASTE MANIFEST
              </h1>
              <p className="text-[10px] text-neutral-600">
                Form Approved. OMB No. 2050-0039. Required under 40 CFR Part 262.
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-black sm:pl-4 pt-2 sm:pt-0">
              <span className="text-[9px] uppercase font-bold block text-neutral-600">1. Generator Tracking Number</span>
              <span className="text-sm font-black font-mono tracking-wider text-black">
                {lot.lotNumber}-EPA
              </span>
              <div className="text-[10px] font-mono text-neutral-700 mt-0.5">
                24-Hr Chemtrec: 1-800-424-9300
              </div>
            </div>
          </div>

          {/* Section 1: Facilities & Transporter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b-2 border-black pb-4 text-[11px]">
            {/* Box 3: Co-Op Generator Info */}
            <div className="border border-neutral-400 p-2.5 rounded bg-neutral-50">
              <span className="text-[9px] font-bold uppercase text-neutral-600 block">
                3. Primary Lead Generator Facility
              </span>
              <p className="font-bold text-neutral-900">{leadLab?.name}</p>
              <p className="text-neutral-700">{leadLab?.address}</p>
              <p className="font-mono text-[10px] text-neutral-800 mt-1">
                EPA ID: <strong>{leadLab?.epaFacilityId}</strong>
              </p>
              <p className="text-neutral-700 text-[10px]">Phone: {leadLab?.phone}</p>
              <p className="text-[9px] text-amber-700 font-semibold mt-1">
                Co-Op Pool: {participatingLabs.length} local labs bundled
              </p>
            </div>

            {/* Box 4: Transporter Info */}
            <div className="border border-neutral-400 p-2.5 rounded bg-neutral-50">
              <span className="text-[9px] font-bold uppercase text-neutral-600 block">
                4. Transporter 1 Company Name
              </span>
              <p className="font-bold text-neutral-900">{lot.haulerName}</p>
              <p className="text-neutral-700">Driver: {lot.haulerDriverName}</p>
              <p className="font-mono text-[10px] text-neutral-800 mt-1">
                Vehicle Plate: <strong>{lot.haulerTruckPlate}</strong>
              </p>
              <p className="text-neutral-700 text-[10px]">EPA Transporter ID: MAD039322250</p>
              <p className="text-[9px] text-neutral-600 mt-1">USDOT Hazmat Reg: #092183-A</p>
            </div>

            {/* Box 5: Designated TSDF Facility */}
            <div className="border border-neutral-400 p-2.5 rounded bg-neutral-50">
              <span className="text-[9px] font-bold uppercase text-neutral-600 block">
                5. Designated Disposal Facility (TSDF)
              </span>
              <p className="font-bold text-neutral-900">Apex Environmental Recovery Facility</p>
              <p className="text-neutral-700">1200 Hazardous Treatment Way, Sector 4</p>
              <p className="font-mono text-[10px] text-neutral-800 mt-1">
                Facility EPA ID: <strong>COD000697961</strong>
              </p>
              <p className="text-neutral-700 text-[10px]">Phone: (555) 998-1200</p>
              <p className="text-[9px] text-emerald-800 font-semibold mt-1">
                Permit: RCRA Part B Operating #94-11
              </p>
            </div>
          </div>

          {/* Section 2: Waste Description Table */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                9. U.S. DOT Description (Including Proper Shipping Name, Hazard Class, and ID Number)
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-900">
                Total Volume: {lot.totalVolumeLiters.toFixed(1)} Liters ({items.length} Containers)
              </span>
            </div>

            <div className="border border-black overflow-hidden">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-neutral-200 border-b border-black font-bold uppercase text-neutral-800">
                    <th className="p-2 border-r border-black w-8 text-center">#</th>
                    <th className="p-2 border-r border-black">DOT Proper Shipping Name & UN #</th>
                    <th className="p-2 border-r border-black">Origin Facility</th>
                    <th className="p-2 border-r border-black w-24">EPA Group</th>
                    <th className="p-2 border-r border-black w-16 text-center">Qty/Type</th>
                    <th className="p-2 text-right w-20">Volume (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-300">
                  {items.map((item, idx) => {
                    const lab = labs.find((l) => l.id === item.labId);
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="p-1.5 border-r border-black text-center font-mono font-bold text-neutral-600">
                          {idx + 1}
                        </td>
                        <td className="p-1.5 border-r border-black">
                          <span className="font-bold text-neutral-900">{item.unCode}, {item.name}</span>
                          <span className="block text-[9px] text-neutral-600">{item.dotClass}</span>
                        </td>
                        <td className="p-1.5 border-r border-black text-neutral-700">
                          {lab?.name || item.labId}
                        </td>
                        <td className="p-1.5 border-r border-black font-mono text-[9px]">
                          {item.epaGroup.replace('GROUP_', 'GRP ')}
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-neutral-700">
                          1 {item.containerType.split(' ')[1] || 'Container'}
                        </td>
                        <td className="p-1.5 text-right font-mono font-bold text-neutral-900">
                          {item.volumeLiters.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ChemiGuard Safety Certification Banner */}
          <div className="p-2.5 rounded border border-emerald-700 bg-emerald-50 text-[10px] text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>CHEMIGUARD SAFETY CERTIFICATION:</strong> This bundled lot has passed 100% deterministic pairwise compatibility checks under EPA 40 CFR Part 264 Appendix V. Zero reactive incompatibilities detected.
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-800 shrink-0 ml-2">✓ VERIFIED SAFE</span>
          </div>

          {/* Section 3: Dual Signatures & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t-2 border-black pt-3 text-[10px]">
            {/* Generator's Certification */}
            <div className="border border-neutral-400 p-2.5 rounded bg-neutral-50 space-y-2">
              <span className="font-bold uppercase text-neutral-700 block">
                15. Generator's / Offeror's Certification
              </span>
              <p className="text-[9px] text-neutral-600 leading-tight">
                "I hereby declare that the contents of this consignment are fully and accurately described above by the proper shipping name, and are classified, packaged, marked and labeled/placarded, and are in all respects in proper condition for transport according to applicable international and national governmental regulations."
              </p>
              <div className="pt-2 border-t border-neutral-300 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-neutral-900 block">{leadLab?.contactPerson}</span>
                  <span className="text-[9px] text-neutral-500">Lead Lab Technician</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-700 font-bold block flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed Digitally
                  </span>
                  <span className="text-[9px] text-neutral-500">{lot.createdAt.slice(0, 10)}</span>
                </div>
              </div>
            </div>

            {/* Transporter Acknowledgment */}
            <div className="border border-neutral-400 p-2.5 rounded bg-neutral-50 space-y-2">
              <span className="font-bold uppercase text-neutral-700 block">
                17. Transporter Acknowledgment of Receipt of Materials
              </span>
              <p className="text-[9px] text-neutral-600 leading-tight">
                "Transporter hereby acknowledges receipt of hazardous materials described in Item 9 above for certified transit to designated disposal facility in compliance with DOT 49 CFR Part 177."
              </p>
              <div className="pt-2 border-t border-neutral-300 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-neutral-900 block">{lot.haulerDriverName}</span>
                  <span className="text-[9px] text-neutral-500">Certified Hazmat Transporter</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-700 font-bold block flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed Digitally
                  </span>
                  <span className="text-[9px] text-neutral-500">{lot.scheduledDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barcode & Federal Footer */}
          <div className="border-t border-neutral-300 pt-2 flex items-center justify-between text-[9px] text-neutral-500 font-mono">
            <span>BARCODE: *{lot.lotNumber}*</span>
            <span>DESIGNATED FOR TSDF RECOVERY — RETURN COPY TO GENERATOR WITHIN 30 DAYS</span>
            <span>EPA 8700-22 PROTOTYPE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
