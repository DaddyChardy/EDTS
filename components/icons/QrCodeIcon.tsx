import React from 'react';

export const QrCodeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4V4zm8 0h6v6h-6V4zM4 12h6v6H4v-6zm12 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm-4 4h2v2h-2v-2z" />
  </svg>
);
