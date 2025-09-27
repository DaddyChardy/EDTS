import React from 'react';
import { Document, DocumentStatus } from '../types';
import { DocumentList } from './DocumentList';

interface DashboardProps {
  documents: Document[];
  onDocumentSelect: (doc: Document) => void;
}

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ documents, onDocumentSelect }) => {
    const pendingApproval = documents.filter(d => d.status === DocumentStatus.FOR_APPROVAL).length;
    const completedToday = documents.filter(d => d.status === DocumentStatus.COMPLETED && new Date(d.updatedAt).toDateString() === new Date().toDateString()).length;
    const drafts = documents.filter(d => d.status === DocumentStatus.DRAFT).length;
    const received = documents.filter(d => d.status === DocumentStatus.RECEIVED).length;
    
    const recentDocuments = [...documents]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    return (
        <div className="p-4 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="For Approval" value={pendingApproval} color="text-yellow-500" />
                <StatCard title="Received" value={received} color="text-cyan-500" />
                <StatCard title="Completed Today" value={completedToday} color="text-green-500" />
                <StatCard title="My Drafts" value={drafts} color="text-slate-500" />
            </div>

            <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Activity</h2>
                <DocumentList documents={recentDocuments} onDocumentSelect={onDocumentSelect} />
            </div>
        </div>
    );
};
