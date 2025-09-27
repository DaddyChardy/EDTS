import React from 'react';
import { ExclamationIcon } from './icons/ExclamationIcon';

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
      className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
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
          {!isError && onConfirm && (
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:ring-offset-slate-800"
            >
              {confirmText}
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:ring-offset-slate-800`}
          >
            {isError ? 'OK' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
