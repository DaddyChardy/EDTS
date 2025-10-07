import React, { useState, useMemo } from 'react';
import { Document, User, UserRole, DocumentHistory, DocumentStatus } from '../types';

interface SuperAdminPageProps {
  allUsers: User[];
  allDocuments: Document[];
  allOffices: string[];
  onAddUser: (user: Omit<User, 'id' | 'avatar_url'>) => void;
  onDeleteUserRequest: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onAddOffice: (officeName: string) => void;
  onDeleteOfficeRequest: (officeName: string) => void;
}

const EditUserModal: React.FC<{
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
  allOffices: string[];
}> = ({ user, onSave, onClose, allOffices }) => {
  const [name, setName] = useState(user.name);
  const [position, setPosition] = useState(user.position);
  const [office, setOffice] = useState(user.office);
  const [role, setRole] = useState<UserRole>(user.role);

  const formInputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
  const formLabelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  const handleSave = () => {
    if (!name || !position || !office || !role) return;
    onSave({ ...user, name, position, office, role });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Edit User Profile</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className={formLabelStyle}>Full Name</label>
            <input type="text" id="edit-name" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} required />
          </div>
           <div>
            <label htmlFor="edit-position" className={formLabelStyle}>Position / Job Title</label>
            <input type="text" id="edit-position" value={position} onChange={e => setPosition(e.target.value)} className={formInputStyle} required />
          </div>
          <div>
            <label htmlFor="edit-office" className={formLabelStyle}>Office/Section</label>
            <select id="edit-office" value={office} onChange={e => setOffice(e.target.value)} className={`${formInputStyle} disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed`} required disabled={allOffices.length === 0}>
              <option value="" disabled>-- Select office --</option>
              {allOffices.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {allOffices.length === 0 && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Cannot edit user: No offices are available. Please add an office first.
                </p>
            )}
          </div>
          <div>
            <label htmlFor="edit-role" className={formLabelStyle}>Role</label>
            <select id="edit-role" value={role} onChange={e => setRole(e.target.value as UserRole)} className={formInputStyle} required>
              {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">Cancel</button>
          <button onClick={handleSave} disabled={allOffices.length === 0} className="px-6 py-2 text-sm font-medium text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const UserManagement: React.FC<Pick<SuperAdminPageProps, 'allUsers' | 'allOffices' | 'onAddUser' | 'onDeleteUserRequest' | 'onUpdateUser'>> = ({ allUsers, allOffices, onAddUser, onDeleteUserRequest, onUpdateUser }) => {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [office, setOffice] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.STAFF);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !position || !office || !role) return;
        onAddUser({ name, position, office, role });
        setName('');
        setPosition('');
        setOffice('');
        setRole(UserRole.STAFF);
    };
    
    const handleDeleteUserClick = (user: User) => {
        onDeleteUserRequest(user);
    };

    const formInputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-400 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
    const formLabelStyle = "block text-sm font-semibold text-slate-700 dark:text-slate-300";

    return (
        <>
            {editingUser && (
                <EditUserModal 
                    user={editingUser} 
                    onSave={onUpdateUser} 
                    onClose={() => setEditingUser(null)}
                    allOffices={allOffices}
                />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit">
                    <h2 className="text-lg font-semibold mb-4">Add New User</h2>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                            <label htmlFor="name" className={formLabelStyle}>Full Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} required />
                        </div>
                        <div>
                            <label htmlFor="position" className={formLabelStyle}>Position / Job Title</label>
                            <input type="text" id="position" value={position} onChange={e => setPosition(e.target.value)} className={formInputStyle} required placeholder="e.g. Cashier I" />
                        </div>
                        <div>
                            <label htmlFor="office" className={formLabelStyle}>Office/Section</label>
                            <select id="office" value={office} onChange={e => setOffice(e.target.value)} className={`${formInputStyle} disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed`} required disabled={allOffices.length === 0}>
                                <option value="" disabled>-- Select office --</option>
                                {allOffices.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                             {allOffices.length === 0 && (
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    Please add an office in the "Office Management" tab before adding a new user.
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="role" className={formLabelStyle}>Role</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className={formInputStyle} required>
                            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <button type="submit" disabled={allOffices.length === 0} className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-sm disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed">Add User</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold mb-4">Existing Users</h2>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                        {allUsers.map(user => (
                            <li key={user.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.position} ({user.office}) - {user.role}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setEditingUser(user)} className="px-3 py-1 text-xs font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-900">Edit</button>
                                    {user.role !== UserRole.SUPER_ADMIN && (
                                        <button onClick={() => handleDeleteUserClick(user)} className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Delete</button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

const OfficeManagement: React.FC<Pick<SuperAdminPageProps, 'allOffices' | 'onAddOffice' | 'onDeleteOfficeRequest'>> = ({ allOffices, onAddOffice, onDeleteOfficeRequest }) => {
    const [name, setName] = useState('');

    const handleAddOffice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAddOffice(name.trim());
        setName('');
    };

    const formInputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-400 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
    const formLabelStyle = "block text-sm font-semibold text-slate-700 dark:text-slate-300";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit">
                <h2 className="text-lg font-semibold mb-4">Add New Office</h2>
                <form onSubmit={handleAddOffice} className="space-y-4">
                    <div>
                        <label htmlFor="office-name" className={formLabelStyle}>Office/Section Name</label>
                        <input type="text" id="office-name" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} required />
                    </div>
                    <button type="submit" className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-sm">Add Office</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-semibold mb-4">Existing Offices</h2>
                {allOffices.length > 0 ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                        {allOffices.map(office => (
                            <li key={office} className="py-3 flex justify-between items-center">
                                <p className="font-medium text-slate-900 dark:text-slate-100">{office}</p>
                                <button onClick={() => onDeleteOfficeRequest(office)} className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Delete</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p className="font-medium">No offices found.</p>
                        <p className="text-sm mt-1">Add a new office using the form to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AnalyticsDashboard: React.FC<{ allDocuments: Document[] }> = ({ allDocuments }) => {

    const formatDuration = (ms: number): string => {
        if (ms <= 0) return "N/A";
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        if (seconds > 0) return `${seconds}s`;
        return `< 1s`;
    };

    const analyticsData = useMemo(() => {
        const receptionTimes: { [office: string]: number[] } = {};
        
        allDocuments.forEach(doc => {
            const chronologicalHistory = [...doc.history].reverse();
            for (let i = 0; i < chronologicalHistory.length - 1; i++) {
                const currentAction = chronologicalHistory[i];
                const nextAction = chronologicalHistory[i + 1];

                const isSendOrForward = currentAction.action.toLowerCase().includes('sent') || currentAction.action.toLowerCase().includes('forwarded');
                const isReceive = nextAction.action.toLowerCase().includes('receive');
                
                if (isSendOrForward && isReceive) {
                    const sendTime = new Date(currentAction.timestamp).getTime();
                    const receiveTime = new Date(nextAction.timestamp).getTime();
                    const duration = receiveTime - sendTime;
                    const receivingOffice = nextAction.office;

                    if (!receptionTimes[receivingOffice]) {
                        receptionTimes[receivingOffice] = [];
                    }
                    receptionTimes[receivingOffice].push(duration);
                }
            }
        });
        
        const avgReceptionTimes: { [office: string]: { avg: number, count: number } } = {};
        for (const office in receptionTimes) {
            const times = receptionTimes[office];
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            avgReceptionTimes[office] = { avg, count: times.length };
        }

        const sortedOffices = Object.entries(avgReceptionTimes).sort(([, a], [, b]) => a.avg - b.avg);
        const fastestOffice = sortedOffices.length > 0 ? { office: sortedOffices[0][0], time: sortedOffices[0][1].avg } : null;
        const slowestOffice = sortedOffices.length > 0 ? { office: sortedOffices[sortedOffices.length - 1][0], time: sortedOffices[sortedOffices.length - 1][1].avg } : null;

        const completedDocs = allDocuments.filter(doc => doc.status === DocumentStatus.COMPLETED);
        const totalCompletionTime = completedDocs.reduce((acc, doc) => {
            const startTime = new Date(doc.createdAt).getTime();
            const endTime = new Date(doc.updatedAt).getTime();
            return acc + (endTime - startTime);
        }, 0);
        const averageCompletionTime = completedDocs.length > 0 ? totalCompletionTime / completedDocs.length : 0;

        const statusCounts = allDocuments.reduce((acc, doc) => {
            acc[doc.status] = (acc[doc.status] || 0) + 1;
            return acc;
        }, {} as { [key in DocumentStatus]?: number });

        const priorityCounts = allDocuments.reduce((acc, doc) => {
            acc[doc.priority] = (acc[doc.priority] || 0) + 1;
            return acc;
        }, {} as { 'Low'?: number, 'Medium'?: number, 'High'?: number });

        return {
            fastestOffice,
            slowestOffice,
            averageCompletionTime,
            completedCount: completedDocs.length,
            statusCounts,
            priorityCounts
        };
    }, [allDocuments]);

    const StatCard = ({ title, value, subtext, icon, color }: { title: string, value: string, subtext?: string, icon: React.ReactNode, color: string }) => (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-start gap-5">
            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg ${color}`}>
                {icon}
            </div>
            <div className="flex-grow">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">{value}</p>
                {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>}
            </div>
        </div>
    );
    
    const FastForwardIcon = ({className}:{className:string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM20.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0014 8v8a1 1 0 001.6.8l5.333-4z" /></svg>;
    const ClockIcon = ({className}:{className:string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const TurtleIcon = ({className}:{className:string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>; // Re-purposing chevron for slow
    const CheckCircleIcon = ({className}:{className:string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                 <StatCard 
                    title="Fastest Receiving Office" 
                    value={analyticsData.fastestOffice?.office || 'N/A'} 
                    subtext={analyticsData.fastestOffice ? `Avg. ${formatDuration(analyticsData.fastestOffice.time)}` : ''}
                    icon={<FastForwardIcon className="w-6 h-6 text-white"/>} 
                    color="bg-green-500"
                />
                <StatCard 
                    title="Slowest Receiving Office" 
                    value={analyticsData.slowestOffice?.office || 'N/A'}
                    subtext={analyticsData.slowestOffice ? `Avg. ${formatDuration(analyticsData.slowestOffice.time)}` : ''}
                    icon={<TurtleIcon className="w-6 h-6 text-white"/>} 
                    color="bg-red-500"
                />
                <StatCard 
                    title="Avg. Completion Time" 
                    value={formatDuration(analyticsData.averageCompletionTime)}
                    subtext="From creation to completion"
                    icon={<ClockIcon className="w-6 h-6 text-white"/>} 
                    color="bg-sky-500"
                />
                <StatCard 
                    title="Total Documents Completed" 
                    value={analyticsData.completedCount.toString()}
                    subtext="System-wide"
                    icon={<CheckCircleIcon className="w-6 h-6 text-white"/>} 
                    color="bg-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Documents by Status</h3>
                    <ul className="space-y-3">
                        {Object.entries(analyticsData.statusCounts).map(([status, count]) => (
                            <li key={status} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{status}</span>
                                <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full font-semibold">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Documents by Priority</h3>
                    <ul className="space-y-3">
                         {Object.entries(analyticsData.priorityCounts).map(([priority, count]) => (
                            <li key={priority} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{priority}</span>
                                <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full font-semibold">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
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
        <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900/50">
                        {allLogs.length > 0 ? allLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-200 dark:border-slate-800">
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
  type AdminTab = 'users' | 'offices' | 'analytics' | 'logs';
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const TabButton = ({ tab, label }: { tab: AdminTab, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Super Admin Panel</h1>
      <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <TabButton tab="users" label="User Management" />
        <TabButton tab="offices" label="Office Management" />
        <TabButton tab="analytics" label="Analytics" />
        <TabButton tab="logs" label="Transaction Logs" />
      </div>
      <div>
        {activeTab === 'users' && <UserManagement {...props} />}
        {activeTab === 'offices' && <OfficeManagement {...props} />}
        {activeTab === 'analytics' && <AnalyticsDashboard allDocuments={props.allDocuments} />}
        {activeTab === 'logs' && <TransactionLogs allDocuments={props.allDocuments} />}
      </div>
    </div>
  );
};