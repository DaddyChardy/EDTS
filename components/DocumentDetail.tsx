import React, { useState } from 'react';
import { Document, DocumentHistory, DocumentStatus, User, UserRole } from '../types';
import { StatusBadge } from './StatusBadge';
import { ADMIN_OFFICE_NAME } from '../constants';
import { PencilIcon } from './icons/PencilIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';

interface DocumentDetailProps {
  document: Document;
  currentUser?: User | null;
  onUpdateDocument?: (doc: Document) => void;
  onBack: () => void;
  allOffices: string[];
  onPrintRequest?: (doc: Document) => void;
  onEditRequest?: (doc: Document) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-md text-slate-800 dark:text-slate-200">{value}</p>
  </div>
);

// Helper to group history items by date for a clearer timeline view
const groupHistoryByDate = (history: DocumentHistory[]): { [key: string]: DocumentHistory[] } => {
    if (!history || history.length === 0) return {};
    const grouped: { [key: string]: DocumentHistory[] } = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    history.forEach(item => {
        const itemDate = new Date(item.timestamp);
        const itemDateStr = itemDate.toDateString();
        let key: string;

        if (itemDateStr === todayStr) {
            key = 'Today';
        } else if (itemDateStr === yesterdayStr) {
            key = 'Yesterday';
        } else {
            key = itemDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(item);
    });

    return grouped;
};

// Helper to return a specific icon based on the action type
const getActionIcon = (action: string) => {
    const lowerCaseAction = action.toLowerCase();
    if (lowerCaseAction.includes('create')) return <PlusCircleIcon className="w-4 h-4" />;
    if (lowerCaseAction.includes('sent')) return <PaperAirplaneIcon className="w-4 h-4" />;
    if (lowerCaseAction.includes('receive')) return <ArrowDownTrayIcon className="w-4 h-4" />;
    if (lowerCaseAction.includes('forward')) return <ArrowRightIcon className="w-4 h-4" />;
    if (lowerCaseAction.includes('approve')) return <CheckBadgeIcon className="w-4 h-4" />;
    if (lowerCaseAction.includes('complete') || lowerCaseAction.includes('finish')) return <CheckCircleIcon className="w-4 h-4" />;
    if (lowerCaseAction.includes('disapprove') || lowerCaseAction.includes('cancel')) return <XCircleIcon className="w-4 h-4" />;
    if (lowerCaseAction.includes('release')) return <ArrowUpTrayIcon className="w-4 h-4" />;
    if (lowerCaseAction.includes('return')) return <ArrowUturnLeftIcon className="w-4 h-4" />;
    return <DocumentIcon className="w-4 h-4" />; // A default icon
};

export const DocumentDetail: React.FC<DocumentDetailProps> = ({ document, currentUser, onUpdateDocument, onBack, allOffices, onPrintRequest, onEditRequest }) => {
    const [remarks, setRemarks] = useState('');
    const [forwardOffice, setForwardOffice] = useState(document.recipientOffice);
    const [showForwardModal, setShowForwardModal] = useState(false);

    const { status } = document;
    
    // currentUser can be null in guest view
    const role = currentUser?.role;
    const office = currentUser?.office;
    const currentUserId = currentUser?.id;

    const lastAction = document.history && document.history.length > 0 ? document.history[0] : null;

    const createHistoryEntry = (action: string, details?: string): DocumentHistory => {
        if (!currentUser) throw new Error("Cannot create history entry without a current user.");
        return {
            id: `h-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action,
            user: currentUser,
            office: currentUser.office,
            remarks: details,
        }
    };

    const handleAction = (newStatus: DocumentStatus, actionName: string, actionDetails?: string) => {
        if (!onUpdateDocument) return;
        const historyEntry = createHistoryEntry(actionName, actionDetails || remarks);
        const updatedDoc: Document = {
            ...document,
            status: newStatus,
            updatedAt: historyEntry.timestamp,
            history: [historyEntry, ...(document.history || [])],
        };
        onUpdateDocument(updatedDoc);
        setRemarks('');
    };

    const handleForward = () => {
        if (!forwardOffice || !onUpdateDocument) return;
        const details = `Forwarded to ${forwardOffice}`;
        const historyEntry = createHistoryEntry("Forwarded", remarks);
        const updatedDoc: Document = {
            ...document,
            status: DocumentStatus.FORWARDED,
            recipientOffice: forwardOffice,
            updatedAt: historyEntry.timestamp,
            history: [
                { ...historyEntry, remarks: details }, 
                ...(document.history || [])
            ],
        };
        onUpdateDocument(updatedDoc);
        setShowForwardModal(false);
        setRemarks('');
        setForwardOffice('');
    };
    
    const handleReturnToSender = () => {
        if (!document.sender || !onUpdateDocument) return; // Should be disabled in UI, but good practice

        const details = `Returned to Sender (${document.sender.office})`;
        const historyEntry = createHistoryEntry("Returned to Sender", "Returned for review/correction.");
        const updatedDoc: Document = {
            ...document,
            status: DocumentStatus.FORWARDED,
            recipientOffice: document.sender.office,
            updatedAt: historyEntry.timestamp,
            history: [
                { ...historyEntry, remarks: details },
                ...(document.history || [])
            ],
        };
        onUpdateDocument(updatedDoc);
    };

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(document.trackingNumber)}`;
    
    const groupedHistory = groupHistoryByDate(document.history || []);


    const renderActions = () => {
        if (!currentUser) {
            return <p className="text-sm text-slate-500 dark:text-slate-400">Log in to take actions on this document.</p>;
        }

        // Any user can send a document they created, if it's a draft
        if (status === DocumentStatus.DRAFT && document.sender?.id === currentUserId) {
            return (
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => onEditRequest && onEditRequest(document)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center gap-2">
                        <PencilIcon className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => onPrintRequest && onPrintRequest(document)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">Print QR Code</button>
                    <button onClick={() => handleAction(DocumentStatus.SENT, "Sent", `Sent to ${document.recipientOffice}`)} className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-sm">Send Document</button>
                </div>
            )
        }

        // Both Admin and the Recipient can receive a document
        if (status === DocumentStatus.SENT && (role === UserRole.ADMIN || office === document.recipientOffice)) {
             const fromOffice = lastAction?.office || document.sender?.office || 'the previous office';
             return <button onClick={() => handleAction(DocumentStatus.RECEIVED, "Received", `Received from ${fromOffice}`)} className="px-5 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 shadow-sm">Receive Document</button>
        }

        if (status === DocumentStatus.RECEIVED && lastAction && office === lastAction.office) {
            // If received by Admin (Records), they can route it or action it directly
            if(office === ADMIN_OFFICE_NAME) {
                return (
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setShowForwardModal(true)} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">Forward</button>
                        <button onClick={() => handleAction(DocumentStatus.APPROVED, "Approved", "Directly approved by Admin")} className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm">Approve</button>
                        <button onClick={() => handleAction(DocumentStatus.COMPLETED, "Completed", "Transaction ended by Admin")} className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm">Mark as Completed</button>
                    </div>
                )
            }
            // If the original sender gets it back, they can re-forward it
            if(document.sender?.id === currentUserId) {
                return <button onClick={() => setShowForwardModal(true)} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">Forward</button>
            }
            // Any other recipient can approve/RTS/cancel
            return (
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleAction(DocumentStatus.APPROVED, "Approved")} className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm">Approve</button>
                    <button onClick={handleReturnToSender} disabled={!document.sender} className="px-5 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed">Return to Sender</button>
                    <button onClick={() => handleAction(DocumentStatus.DISAPPROVED, "Cancel")} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm">Cancel</button>
                </div>
            )
        }

        if (status === DocumentStatus.FORWARDED && office === document.recipientOffice) {
            const fromOffice = lastAction?.office || 'the previous office';
            return <button onClick={() => handleAction(DocumentStatus.RECEIVED, "Received", `Received from ${fromOffice}`)} className="px-5 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 shadow-sm">Receive Document</button>
        }

        if (status === DocumentStatus.APPROVED && role === UserRole.ADMIN) {
             return (
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleAction(DocumentStatus.COMPLETED, "Completed", "Transaction Ended")} className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm">Mark as Completed</button>
                    <button onClick={() => handleAction(DocumentStatus.RELEASED, "Released", "Marked for release")} className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-sm">For Release</button>
                </div>
             )
        }
        
        // Sender confirms completion after release
        if (status === DocumentStatus.RELEASED && document.sender?.id === currentUserId) {
            return (
                <button onClick={() => handleAction(DocumentStatus.COMPLETED, "Transaction Finished", "Released document received by sender.")} className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm">
                    Finish Transaction
                </button>
            );
        }

        return <p className="text-sm text-slate-500 dark:text-slate-400">No actions available for you at this stage.</p>;
    }


    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <button onClick={onBack} className="mb-6 text-sm font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                {currentUser ? 'Back to documents' : 'Back to Home'}
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{document.title}</h1>
                                <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-2">{document.trackingNumber}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <StatusBadge status={document.status} />
                            </div>
                        </div>
                        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <DetailItem label="Category" value={document.category} />
                            <DetailItem label="Priority" value={<span className={`font-semibold ${document.priority === 'High' ? 'text-red-500' : document.priority === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>{document.priority}</span>} />
                            <DetailItem label="Sender" value={document.sender ? `${document.sender.name} (${document.sender.office})` : 'Unknown User'} />
                            <DetailItem label="Intended Recipient" value={document.recipientOffice} />
                            <DetailItem label="Delivery Type" value={document.deliveryType} />
                            <DetailItem label="Created At" value={new Date(document.createdAt).toLocaleString()} />
                            <div className="md:col-span-2">
                                <DetailItem label="Description" value={<p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">{document.description}</p>} />
                            </div>
                        </div>
                    </div>

                    {/* Action Form */}
                    {currentUser && (
                      <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Available Actions</h2>
                          <div className="mt-4">
                              {renderActions()}
                          </div>
                      </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                        <img src={qrCodeUrl} alt="QR Code for tracking number" className="w-40 h-40 border-4 border-slate-200 dark:border-slate-700 p-1 rounded-lg"/>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Scan to track document</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-200">Document History</h2>
                        <div className="space-y-6">
                            {Object.keys(groupedHistory).length > 0 ? (
                                Object.entries(groupedHistory).map(([date, items]) => (
                                    <div key={date}>
                                        <div className="flex items-center">
                                            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                            <span className="flex-shrink mx-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{date}</span>
                                            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                        </div>
                                        <ol className="relative border-s-2 border-slate-200 dark:border-slate-700 mt-4 ml-3">
                                            {items.map((item) => {
                                                const isLatest = document.history[0].id === item.id;
                                                return (
                                                    <li key={item.id} className="mb-6 ms-8">
                                                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -start-[13px] ring-8 ring-white dark:ring-slate-900/50 ${isLatest ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                                            <span className={`text-white`}>
                                                                {getActionIcon(item.action)}
                                                            </span>
                                                        </span>
                                                        <div className={`p-3 rounded-lg border ${isLatest ? 'bg-sky-50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700' : 'bg-white dark:bg-slate-800/20 border-slate-200 dark:border-slate-700/50'}`}>
                                                            <div className="items-center justify-between sm:flex mb-1">
                                                                <div className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                                    {item.action}
                                                                </div>
                                                                <time className="mb-1 text-xs font-normal text-slate-400 sm:order-last sm:mb-0">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                                                            </div>
                                                            <p className="text-sm font-normal text-slate-500 dark:text-slate-400">by {item.user.name} at {item.office}</p>
                                                            {item.remarks && <p className="mt-2 text-sm font-normal text-slate-600 dark:text-slate-300 italic p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">"{item.remarks}"</p>}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">No history to display.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Forward Modal */}
            {showForwardModal && currentUser && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Forward Document</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="forwardOffice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Forward To</label>
                                <select 
                                    id="forwardOffice" 
                                    value={forwardOffice} 
                                    onChange={e => setForwardOffice(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" 
                                    required
                                >
                                    <option value="" disabled>-- Select an office --</option>
                                    {allOffices.filter(o => o !== currentUser.office).map(office => (
                                        <option key={office} value={office}>{office}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="forwardRemarks" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Remarks (optional)</label>
                                <textarea id="forwardRemarks" value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setShowForwardModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">Cancel</button>
                            <button onClick={handleForward} disabled={!forwardOffice} className="px-6 py-2 text-sm font-medium text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed">Confirm Forward</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};