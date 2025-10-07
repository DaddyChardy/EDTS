import React from 'react';

export const ApprovalIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.25 1.125-2.25 2.25v15c0 1.125 1.125 2.25 2.25 2.25h15c1.125 0 2.25-1.125 2.25-2.25v-4.5M13.5 4.875c0-1.036.84-1.875 1.875-1.875h1.5c1.036 0 1.875.84 1.875 1.875v1.5c0 1.036-.84 1.875-1.875 1.875h-1.5A1.875 1.875 0 0 1 13.5 6.375v-1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.375c.392-.621.643-1.35.643-2.125 0-1.482-.636-2.822-1.674-3.75M9 15.375c.392.621.643 1.35.643 2.125 0 1.482-.636 2.822-1.674 3.75M15 9.375c-.392-.621-.643-1.35-.643-2.125 0-1.482.636-2.822 1.674-3.75M15 15.375c-.392.621-.643 1.35-.643 2.125 0 1.482.636 2.822 1.674 3.75" />
    </svg>
);