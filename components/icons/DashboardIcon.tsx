
import React from 'react';

export const DashboardIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4v10H3V10zM10 3h4v17h-4V3zM17 6h4v14h-4V6z" />
  </svg>
);
