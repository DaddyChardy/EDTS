import React, { useState } from 'react';
import { Document, DocumentHistory, DocumentStatus, User, UserRole } from '../types';
import { StatusBadge } from './StatusBadge';
import { ADMIN_OFFICE_NAME } from '../constants';
import { PencilIcon } from './icons/PencilIcon';

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
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-sm text-slate-900 dark:text-slate-200">{value}</p>
  </div>
);

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
            // FIX: Removed redundant 'new' keyword.
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

    const renderActions = () => {
        if (!currentUser) {
            return <p className="text-sm text-slate-500 dark:text-slate-400">Log in to take actions on this document.</p>;
        }

        // Any user can send a document they created, if it's a draft
        if (status === DocumentStatus.DRAFT && document.sender?.id === currentUserId) {
            return (
                <>
                    <button onClick={() => onEditRequest && onEditRequest(document)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500 flex items-center gap-2">
                        <PencilIcon className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => onPrintRequest && onPrintRequest(document)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500">Print QR Code</button>
                    <button onClick={() => handleAction(DocumentStatus.SENT, "Sent", `Sent to ${document.recipientOffice}`)} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700">Send Document</button>
                </>
            )
        }

        // Both Admin and the Recipient can receive a document
        if (status === DocumentStatus.SENT && (role === UserRole.ADMIN || office === document.recipientOffice)) {
             const fromOffice = lastAction?.office || document.sender?.office || 'the previous office';
             return <button onClick={() => handleAction(DocumentStatus.RECEIVED, "Received", `Received from ${fromOffice}`)} className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700">Receive</button>
        }

        if (status === DocumentStatus.RECEIVED && lastAction && office === lastAction.office) {
            // If received by Admin (Records), they can route it or action it directly
            if(office === ADMIN_OFFICE_NAME) {
                return (
                    <>
                        <button onClick={() => setShowForwardModal(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Forward</button>
                        <button onClick={() => handleAction(DocumentStatus.APPROVED, "Approved", "Directly approved by Admin")} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Approve</button>
                        <button onClick={() => handleAction(DocumentStatus.COMPLETED, "Completed", "Transaction ended by Admin")} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700">Mark as Completed</button>
                    </>
                )
            }
            // If the original sender gets it back, they can re-forward it
            if(document.sender?.id === currentUserId) {
                return <button onClick={() => setShowForwardModal(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Forward</button>
            }
            // Any other recipient can approve/RTS/cancel
            return (
                <>
                    <button onClick={() => handleAction(DocumentStatus.APPROVED, "Approved")} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Approved</button>
                    <button onClick={handleReturnToSender} disabled={!document.sender} className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:bg-slate-400 disabled:cursor-not-allowed">RTS (Return to Sender)</button>
                    <button onClick={() => handleAction(DocumentStatus.DISAPPROVED, "Cancel")} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Cancel</button>
                </>
            )
        }

        if (status === DocumentStatus.FORWARDED && office === document.recipientOffice) {
            const fromOffice = lastAction?.office || 'the previous office';
            return <button onClick={() => handleAction(DocumentStatus.RECEIVED, "Received", `Received from ${fromOffice}`)} className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700">Receive</button>
        }

        if (status === DocumentStatus.APPROVED && role === UserRole.ADMIN) {
             return (
                <>
                    <button onClick={() => handleAction(DocumentStatus.COMPLETED, "Completed", "Transaction Ended")} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700">Mark as Completed</button>
                    <button onClick={() => handleAction(DocumentStatus.RELEASED, "Released", "Marked for release")} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700">For Release</button>
                </>
             )
        }
        
        // Sender confirms completion after release
        if (status === DocumentStatus.RELEASED && document.sender?.id === currentUserId) {
            return (
                <button onClick={() => handleAction(DocumentStatus.COMPLETED, "Transaction Finished", "Released document received by sender.")} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
                    Finish Transaction
                </button>
            );
        }

        return <p className="text-sm text-slate-500 dark:text-slate-400">No actions available for you at this stage.</p>;
    }


    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <button onClick={onBack} className="mb-6 text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300">
                &larr; {currentUser ? 'Back to documents' : 'Back to Home'}
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{document.title}</h1>
                                <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">{document.trackingNumber}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <StatusBadge status={document.status} />
                            </div>
                        </div>
                        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Category" value={document.category} />
                            <DetailItem label="Priority" value={document.priority} />
                            <DetailItem label="Sender" value={document.sender ? `${document.sender.name} (${document.sender.office})` : 'Unknown User'} />
                            <DetailItem label="Intended Recipient" value={document.recipientOffice} />
                            <DetailItem label="Delivery Type" value={document.deliveryType} />
                            <DetailItem label="Created At" value={new Date(document.createdAt).toLocaleString()} />
                            <div className="md:col-span-2">
                                <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{document.description}</p>} />
                            </div>
                        </div>
                    </div>

                    {/* Action Form */}
                    {currentUser && (
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                          <h2 className="text-lg font-semibold dark:text-slate-200">Available Actions</h2>
                          <div className="mt-4 flex flex-wrap gap-4 items-center">
                              {renderActions()}
                          </div>
                      </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                        <img src={qrCodeUrl} alt="QR Code for tracking number" className="w-40 h-40 border-4 border-slate-200 dark:border-slate-600 p-1 rounded-lg"/>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Scan to track document</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold mb-4 dark:text-slate-200">Document History</h2>
                        <ol className="relative border-s border-slate-200 dark:border-slate-700">
                             {(document.history || []).map((item, index) => (
                                <li key={item.id} className="mb-6 ms-4">
                                    <div className={`absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 border border-white dark:border-slate-800 ${index === 0 ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                    <time className="mb-1 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">{new Date(item.timestamp).toLocaleString()}</time>
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        {item.action} 
                                        {index === 0 && <span className="text-xs font-bold text-sky-600 dark:text-sky-400">LATEST</span>}
                                    </h3>
                                    <p className="text-sm font-normal text-slate-500 dark:text-slate-400">by {item.user.name} at {item.office}</p>
                                    {item.remarks && <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300 italic">"{item.remarks}"</p>}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>

            {/* Forward Modal */}
            {showForwardModal && currentUser && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
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