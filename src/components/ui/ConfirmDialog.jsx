import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-pit border border-steel/60 rounded-2xl shadow-2xl modal-content">
        <div className="p-6 text-center">
          <div className={`w-12 h-12 ${danger ? 'bg-red-500/10' : 'bg-blue-500/10'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle size={24} className={danger ? 'text-red-400' : 'text-blue-400'} />
          </div>
          <h3 className="text-white font-display font-bold text-lg mb-2">{title}</h3>
          <p className="text-slate-400 text-sm font-body">{message}</p>
        </div>
        <div className="flex gap-3 p-4 border-t border-steel/40">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-semibold text-sm rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-2.5 ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-display font-semibold text-sm rounded-lg transition-all`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
