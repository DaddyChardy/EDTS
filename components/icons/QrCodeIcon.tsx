
import React from 'react';

export const QrCodeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5h3v3H5zM5 16h3v3H5zM16 5h3v3h-3zM16 16h3v3h-3zM10.5 5.5h3v3h-3zM5.5 10.5h3v3h-3zM10.5 10.5h3v3h-3zM10.5 16h3v3h-3zM16 10.5h3v3h-3z" />
  </svg>
);
