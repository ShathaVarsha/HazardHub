import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-teal-600 shrink-0" />,
        };

        const borders = {
          success: 'border-l-4 border-l-emerald-500 border-slate-200 bg-white text-slate-800 shadow-md',
          warning: 'border-l-4 border-l-amber-500 border-slate-200 bg-white text-slate-800 shadow-md',
          error: 'border-l-4 border-l-rose-500 border-slate-200 bg-white text-slate-800 shadow-md',
          info: 'border-l-4 border-l-teal-500 border-slate-200 bg-white text-slate-800 shadow-md',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl border shadow-md transition-all animate-in fade-in slide-in-from-right-4 ${borders[toast.type]}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5">{icons[toast.type]}</span>
              <p className="text-xs font-semibold leading-relaxed text-slate-800">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
