import React, { useState, useCallback } from 'react';
import { Document, User, DocumentStatus } from '../types';
import { classifyDocument, ClassificationResult } from '../services/geminiService';

interface CreateDocumentFormProps {
  currentUser: User;
  onAddDocument: (doc: Document) => void;
  onCancel: () => void;
  allOffices: string[];
}

export const CreateDocumentForm: React.FC<CreateDocumentFormProps> = ({ currentUser, onAddDocument, onCancel, allOffices }) => {
  const [title, setTitle] = useState('');
  const [recipientOffice, setRecipientOffice] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Internal' | 'External'>('Internal');
  const [aiSuggestion, setAiSuggestion] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleDescriptionBlur = useCallback(async () => {
    if (description.trim().length > 20) {
      setIsClassifying(true);
      const result = await classifyDocument(description);
      setAiSuggestion(result);
      setIsClassifying(false);
    }
  }, [description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !recipientOffice || !description) return;

    const now = new Date().toISOString();
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      trackingNumber: `TDC-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      title,
      category: aiSuggestion?.category || 'General',
      deliveryType,
      recipientOffice,
      sender: currentUser,
      description,
      status: DocumentStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
      history: [{
        id: `h-${Date.now()}`,
        timestamp: now,
        action: 'Created',
        user: currentUser,
        office: currentUser.office
      }],
      priority: aiSuggestion?.priority || 'Medium',
    };
    onAddDocument(newDoc);
  };

  const formInputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
  const formLabelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="p-4 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <label htmlFor="title" className={formLabelStyle}>Document Title</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={formInputStyle} required />
        </div>
        
        <div>
          <label htmlFor="recipientOffice" className={formLabelStyle}>Recipient Office/Section</label>
          <select 
            id="recipientOffice" 
            value={recipientOffice} 
            onChange={e => setRecipientOffice(e.target.value)} 
            className={formInputStyle} 
            required
          >
            <option value="" disabled>-- Select a recipient --</option>
            {allOffices.map(office => (
                <option key={office} value={office}>{office}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="description" className={formLabelStyle}>Description / Remarks</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} onBlur={handleDescriptionBlur} rows={5} className={formInputStyle} required />
        </div>

        {isClassifying && <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">AI is classifying your document...</div>}
        
        {aiSuggestion && (
            <div className="p-4 bg-sky-50 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-900 rounded-lg">
                <h4 className="font-semibold text-sky-800 dark:text-sky-300">AI Suggestion</h4>
                <p className="text-sm text-sky-700 dark:text-sky-400">
                    Category: <span className="font-medium">{aiSuggestion.category}</span>, 
                    Priority: <span className="font-medium">{aiSuggestion.priority}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">These will be automatically saved with your document.</p>
            </div>
        )}

        <div>
            <label className={formLabelStyle}>Delivery Type</label>
            <div className="mt-2 flex gap-4">
                <label className="flex items-center">
                    <input type="radio" name="deliveryType" value="Internal" checked={deliveryType === 'Internal'} onChange={() => setDeliveryType('Internal')} className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-gray-300 dark:border-slate-500 bg-slate-100 dark:bg-slate-600" />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Internal</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="deliveryType" value="External" checked={deliveryType === 'External'} onChange={() => setDeliveryType('External')} className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-gray-300 dark:border-slate-500 bg-slate-100 dark:bg-slate-600" />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">External</span>
                </label>
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">Cancel</button>
          <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save Draft</button>
        </div>
      </form>
    </div>
  );
};
