import React, { useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-close after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const successStyles = 'bg-slate-800 border-green-500';
  const errorStyles = 'bg-slate-800 border-red-500';
  
  const icon = type === 'success' 
    ? <div className="p-2 bg-green-500/20 rounded-full"><CheckIcon className="w-5 h-5 text-green-400" /></div>
    : <div className="p-2 bg-red-500/20 rounded-full"><ExclamationIcon className="w-5 h-5 text-red-400" /></div>;

  return (
    <div 
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-4 w-full max-w-sm p-4 text-white border-l-4 ${type === 'success' ? successStyles : errorStyles} rounded-lg shadow-2xl transition-transform transform-gpu animate-toast-in`}
      role="alert"
    >
      {icon}
      <div className="text-sm font-medium text-slate-200">
        {message}
      </div>
      <button 
        type="button" 
        className="ms-auto -mx-1.5 -my-1.5 text-slate-400 hover:text-white rounded-lg focus:ring-2 focus:ring-slate-500 p-1.5 inline-flex items-center justify-center h-8 w-8" 
        onClick={onClose} 
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <CloseIcon className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes toast-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-toast-in {
          animation: toast-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};