import React from 'react';
import { Document } from '../types';
import { StatusBadge } from './StatusBadge';
import { DocumentIcon } from './icons/DocumentIcon';

interface DocumentListProps {
  documents: Document[];
  onDocumentSelect: (doc: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDocumentSelect }) => {
  return (
    <div className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 dark:border-slate-700/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-white/20 dark:bg-white/5">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tracking #</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Last Updated</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Sender</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b border-white/20 dark:border-slate-700/50 hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700 dark:text-slate-300">{doc.trackingNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200 font-medium max-w-xs truncate">{doc.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{new Date(doc.updatedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{doc.sender?.name || 'Unknown User'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onDocumentSelect(doc)} className="text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 font-semibold">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <DocumentIcon className="w-10 h-10 text-slate-400"/>
                    <p className="font-medium">No documents found.</p>
                    <p className="text-sm">Create a new document to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};