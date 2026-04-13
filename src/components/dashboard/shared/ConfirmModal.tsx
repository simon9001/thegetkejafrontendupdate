// components/dashboard/shared/ConfirmModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: (notes?: string) => void;
  onCancel: () => void;
  showNotes?: boolean;
  notesPlaceholder?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, title, message, confirmLabel, confirmClass,
  onConfirm, onCancel, showNotes, notesPlaceholder,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 p-6"
      >
        <h3 className="font-bold text-[#222222] mb-2">{title}</h3>
        <p className="text-sm text-[#6a6a6a] mb-4">{message}</p>
        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={notesPlaceholder ?? 'Add notes…'}
            rows={3}
            className="w-full text-sm text-[#222222] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#ff385c]/30 resize-none mb-4"
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-[#6a6a6a] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(notes);
              setNotes('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmModal;
