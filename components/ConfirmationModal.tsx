import React from 'react';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmText?: string;
  isError?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  isError = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if(onConfirm) onConfirm();
    onCancel(); // Close modal after confirm
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white/50 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl w-full max-w-md border border-white/30 dark:border-slate-700/30">
        <button onClick={onCancel} className="absolute top-3 right-3 p-1 rounded-full text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-700/50">
          <CloseIcon className="w-5 h-5"/>
        </button>
        <div className="flex items-start gap-4">
          {isError && (
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
          )}
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100" id="modal-title">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`w-full sm:w-auto inline-flex justify-center rounded-lg border border-slate-300/70 dark:border-slate-600/70 bg-white/50 dark:bg-slate-900/50 px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:ring-offset-slate-800`}
          >
            {isError ? 'OK' : 'Cancel'}
          </button>
           {!isError && onConfirm && (
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:ring-offset-slate-800"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};