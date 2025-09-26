import React from 'react';
import { DocumentStatus } from '../types';

interface StatusBadgeProps {
  status: DocumentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColors: { [key in DocumentStatus]: string } = {
    [DocumentStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [DocumentStatus.SENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [DocumentStatus.RECEIVED]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    [DocumentStatus.FORWARDED]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    [DocumentStatus.FOR_APPROVAL]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [DocumentStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [DocumentStatus.RELEASED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [DocumentStatus.COMPLETED]: 'bg-green-200 text-green-900 font-semibold dark:bg-green-800 dark:text-green-100',
    [DocumentStatus.DISAPPROVED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
      {status}
    </span>
  );
};