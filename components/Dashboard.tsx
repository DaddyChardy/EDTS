import React from 'react';
import { Document, DocumentStatus } from '../types';
import { DocumentList } from './DocumentList';
import { ApprovalIcon } from './icons/ApprovalIcon';
import { InboxIcon } from './icons/InboxIcon';
import { CompletedIcon } from './icons/CompletedIcon';
import { DraftIcon } from './icons/DraftIcon';


interface DashboardProps {
  documents: Document[];
  onDocumentSelect: (doc: Document) => void;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/30 dark:border-slate-700/30 flex items-center gap-6">
        <div className={`w-12 h-12 flex items-center justify-center rounded-full shadow-md ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="For Approval" value={pendingApproval} icon={<ApprovalIcon className="w-6 h-6 text-white"/>} color="bg-yellow-500" />
                <StatCard title="Received" value={received} icon={<InboxIcon className="w-6 h-6 text-white"/>} color="bg-cyan-500" />
                <StatCard title="Completed Today" value={completedToday} icon={<CompletedIcon className="w-6 h-6 text-white"/>} color="bg-green-500" />
                <StatCard title="My Drafts" value={drafts} icon={<DraftIcon className="w-6 h-6 text-white"/>} color="bg-slate-500" />
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Activity</h2>
                <DocumentList documents={recentDocuments} onDocumentSelect={onDocumentSelect} />
            </div>
        </div>
    );
};