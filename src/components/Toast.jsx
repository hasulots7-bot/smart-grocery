import React from 'react';
import { RotateCcw, X } from 'lucide-react';

export default function Toast({ toast, onUndo, onClose, lang }) {
  if (!toast) return null;

  return (
    <div className={`toast-notification ${toast.type || 'info'}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {toast.type === 'success' ? '✓' : '🗑️'}
        </span>
        <span className="toast-message">{toast.message}</span>
      </div>

      <div className="toast-actions">
        {toast.canUndo && onUndo && (
          <button
            type="button"
            className="toast-undo-btn"
            onClick={onUndo}
          >
            <RotateCcw size={14} />
            <span>{lang === 'ta' ? 'மீட்டெடு' : 'Undo'}</span>
          </button>
        )}
        <button
          type="button"
          className="toast-close-btn"
          onClick={onClose}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
