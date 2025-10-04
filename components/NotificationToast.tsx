import React, { useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';

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

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? <CheckIcon className="w-6 h-6 text-white" /> : null;

  return (
    <div 
      className={`fixed bottom-5 right-5 z-50 flex items-center w-full max-w-xs p-4 text-white ${bgColor} rounded-lg shadow-lg transition-transform transform-gpu animate-toast-in`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="ms-3 text-sm font-medium">
        {message}
      </div>
      <button 
        type="button" 
        className="ms-auto -mx-1.5 -my-1.5 bg-white/20 text-white hover:text-white/80 rounded-lg focus:ring-2 focus:ring-white/50 p-1.5 hover:bg-white/30 inline-flex items-center justify-center h-8 w-8" 
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
