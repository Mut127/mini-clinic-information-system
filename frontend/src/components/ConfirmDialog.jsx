// src/components/ConfirmDialog.jsx
import Modal from './Modal';
import { AlertTriangle, HelpCircle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger', // 'danger' | 'primary'
}) => {
  const isDanger = variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center px-2 pt-2 pb-1">
        <div
          className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            isDanger ? 'bg-red-50' : 'bg-teal-50'
          }`}
        >
          {isDanger ? (
            <AlertTriangle size={26} className="text-red-500" />
          ) : (
            <HelpCircle size={26} className="text-teal-600" />
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-800 mb-1.5">
          {title || (isDanger ? 'Hapus Data?' : 'Konfirmasi')}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white shadow-sm transition ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;