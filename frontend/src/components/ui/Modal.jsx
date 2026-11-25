'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const sizeClass = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className={`relative w-full ${sizeClass} rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
