import React from 'react';
import { DocumentStatus } from '../types';

interface StatusBadgeProps {
  status: DocumentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColors: { [key in DocumentStatus]: string } = {
    [DocumentStatus.DRAFT]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    [DocumentStatus.SENT]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    [DocumentStatus.RECEIVED]: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    [DocumentStatus.FORWARDED]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    [DocumentStatus.FOR_APPROVAL]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    [DocumentStatus.APPROVED]: 'bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300',
    [DocumentStatus.RELEASED]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    [DocumentStatus.COMPLETED]: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    [DocumentStatus.DISAPPROVED]: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  };

  const dotColors: { [key in DocumentStatus]: string } = {
    [DocumentStatus.DRAFT]: 'bg-gray-400',
    [DocumentStatus.SENT]: 'bg-blue-400',
    [DocumentStatus.RECEIVED]: 'bg-cyan-400',
    [DocumentStatus.FORWARDED]: 'bg-indigo-400',
    [DocumentStatus.FOR_APPROVAL]: 'bg-yellow-400',
    [DocumentStatus.APPROVED]: 'bg-lime-400',
    [DocumentStatus.RELEASED]: 'bg-purple-400',
    [DocumentStatus.COMPLETED]: 'bg-green-400',
    [DocumentStatus.DISAPPROVED]: 'bg-red-400',
  };


  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${statusColors[status]}`}>
      <span className={`h-2 w-2 rounded-full ${dotColors[status]}`}></span>
      {status}
    </span>
  );
};