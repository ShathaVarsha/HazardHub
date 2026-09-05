import React from 'react';
import type { IncompatibilityIssue } from '../../types';
import { ShieldAlert, Flame, Skull, Zap, X } from 'lucide-react';

interface ChemiGuardAlertProps {
  issues: IncompatibilityIssue[];
  onRemoveItem?: (itemId: string) => void;
}

export const ChemiGuardAlert: React.FC<ChemiGuardAlertProps> = ({ issues, onRemoveItem }) => {
  if (issues.length === 0) return null;

  const consequenceIcons = {
    EXPLOSION: <Flame className="w-4 h-4 text-rose-600 animate-bounce" />,
    TOXIC_GAS: <Skull className="w-4 h-4 text-purple-600 animate-pulse" />,
    CORROSIVE_SPATTER: <Zap className="w-4 h-4 text-amber-600" />,
    FIRE: <Flame className="w-4 h-4 text-orange-600" />,
  };

  const consequenceBadges = {
    EXPLOSION: 'bg-rose-100 text-rose-800 border-rose-300',
    TOXIC_GAS: 'bg-purple-100 text-purple-800 border-purple-300',
    CORROSIVE_SPATTER: 'bg-amber-100 text-amber-800 border-amber-300',
    FIRE: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  return (
    <aside aria-label="ChemiGuard Safety Alert" className="rounded-3xl border-2 border-rose-300 bg-rose-50/80 p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in">
      {/* Alert Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-100 border border-rose-300 text-rose-600 shrink-0 shadow-xs">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-rose-950 tracking-tight">
                CHEMIGUARD SAFETY BLOCK: Reactive Incompatibility Detected
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-200 text-rose-900">
                {issues.length} Violation{issues.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-0.5">
              Federal EPA 40 CFR Appendix V and DOT Hazmat rules strictly prohibit co-loading these reactive chemicals into the same vehicle pool.
            </p>
          </div>
        </div>
      </div>

      {/* Individual Violation Cards */}
      <div className="space-y-3 pt-1">
        {issues.map((issue, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-rose-200 space-y-3 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {consequenceIcons[issue.consequence]}
                <span className="font-bold text-xs text-slate-900 leading-snug">
                  {issue.hazardDescription}
                </span>
              </div>
              <span
                className={`self-start sm:self-auto px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border font-mono ${
                  consequenceBadges[issue.consequence]
                }`}
              >
                {issue.consequence.replace('_', ' ')} RISK
              </span>
            </div>

            {/* Conflicting Pair visualization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Offending Canister A</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{issue.itemAName}</span>
                  <span className="block text-[10px] font-mono text-rose-700 font-semibold mt-1">
                    {issue.itemAGroup}
                  </span>
                </div>
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(issue.itemAId)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 ml-2 transition-colors cursor-pointer"
                    title="Remove Canister A from Lot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Offending Canister B</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{issue.itemBName}</span>
                  <span className="block text-[10px] font-mono text-rose-700 font-semibold mt-1">
                    {issue.itemBGroup}
                  </span>
                </div>
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(issue.itemBId)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 ml-2 transition-colors cursor-pointer"
                    title="Remove Canister B from Lot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Scientific Diagnostic & Remedy */}
            <div className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong className="text-teal-700 font-semibold">Technical Diagnostic:</strong> {issue.remedyRecommendation}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
