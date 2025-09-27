import React, { useState, useMemo } from 'react';
import { Document, User, UserRole, DocumentHistory } from '../types';
import { OFFICES } from '../constants';
import { generateReportSummary } from '../services/geminiService';

interface SuperAdminPageProps {
  allUsers: User[];
  allDocuments: Document[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
}

const UserManagement: React.FC<SuperAdminPageProps> = ({ allUsers, onAddUser, onDeleteUser }) => {
    const [name, setName] = useState('');
    const [office, setOffice] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.STAFF);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !office || !role) return;
        onAddUser({ name, office, role });
        setName('');
        setOffice('');
        setRole(UserRole.STAFF);
    };
    
    const handleDeleteUserClick = (user: User) => {
        if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            onDeleteUser(user.id);
        }
    };

    const formInputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
    const formLabelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
                <h2 className="text-lg font-semibold mb-4">Add New User</h2>
                <form onSubmit={handleAddUser} className="space-y-4">
                     <div>
                        <label htmlFor="name" className={formLabelStyle}>Full Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} required />
                    </div>
                     <div>
                        <label htmlFor="office" className={formLabelStyle}>Office/Section</label>
                        <select id="office" value={office} onChange={e => setOffice(e.target.value)} className={formInputStyle} required>
                            <option value="" disabled>-- Select office --</option>
                            {OFFICES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="role" className={formLabelStyle}>Role</label>
                        <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className={formInputStyle} required>
                           {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700">Add User</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold mb-4">Existing Users</h2>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {allUsers.map(user => (
                        <li key={user.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user.office} - {user.role}</p>
                            </div>
                            {user.role !== UserRole.SUPER_ADMIN && (
                                <button onClick={() => handleDeleteUserClick(user)} className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Delete</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const Reports: React.FC<{ allDocuments: Document[] }> = ({ allDocuments }) => {
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport('');
        const summary = await generateReportSummary(allDocuments);
        setReport(summary);
        setIsLoading(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold mb-4">Document Transaction Report</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Click the button below to generate an AI-powered summary of all document transactions in the system.
            </p>
            <button onClick={handleGenerateReport} disabled={isLoading} className="px-6 py-2 text-sm font-medium text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
            {isLoading && <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 animate-pulse">AI is analyzing data...</div>}
            {report && (
                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="font-semibold mb-2">Generated Summary</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md whitespace-pre-wrap">
                        {report}
                    </div>
                </div>
            )}
        </div>
    );
};

const TransactionLogs: React.FC<{ allDocuments: Document[] }> = ({ allDocuments }) => {
    const allLogs = useMemo(() => {
        const logs: (DocumentHistory & { trackingNumber: string, docTitle: string })[] = [];
        allDocuments.forEach(doc => {
            doc.history.forEach(historyItem => {
                logs.push({ ...historyItem, trackingNumber: doc.trackingNumber, docTitle: doc.title });
            });
        });
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allDocuments]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {allLogs.length > 0 ? allLogs.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                                    <p className="max-w-xs truncate">{log.docTitle}</p>
                                    <p className="font-mono text-xs text-slate-500">{log.trackingNumber}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.action}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.user.name} ({log.office})</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 italic max-w-sm truncate">{log.remarks || '-'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    No transaction logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

export const SuperAdminPage: React.FC<SuperAdminPageProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'logs'>('users');

  const TabButton = ({ tab, label }: { tab: 'users' | 'reports' | 'logs', label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Super Admin Panel</h1>
      <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <TabButton tab="users" label="User Management" />
        <TabButton tab="reports" label="Generate Reports" />
        <TabButton tab="logs" label="Transaction Logs" />
      </div>
      <div>
        {activeTab === 'users' && <UserManagement {...props} />}
        {activeTab === 'reports' && <Reports allDocuments={props.allDocuments} />}
        {activeTab === 'logs' && <TransactionLogs allDocuments={props.allDocuments} />}
      </div>
    </div>
  );
};