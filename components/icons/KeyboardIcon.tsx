import React from 'react';

export const KeyboardIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5V3m8 2V3m-4 16h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h8" />
    </svg>
);
