import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onCancel} className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 transition-all">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
