import React, { useState, useCallback } from 'react';
import { Document, User, DocumentStatus } from '../types';
import { classifyDocument, ClassificationResult } from '../services/geminiService';

interface CreateDocumentFormProps {
  currentUser: User;
  onAddDocument?: (doc: Document) => void;
  onUpdateDocument?: (doc: Document) => void;
  onCancel: () => void;
  allOffices: string[];
  documentToEdit?: Document;
}

export const CreateDocumentForm: React.FC<CreateDocumentFormProps> = ({ currentUser, onAddDocument, onUpdateDocument, onCancel, allOffices, documentToEdit }) => {
  const isEditMode = !!documentToEdit;

  const [title, setTitle] = useState(documentToEdit?.title || '');
  const [recipientOffice, setRecipientOffice] = useState(documentToEdit?.recipientOffice || '');
  const [description, setDescription] = useState(documentToEdit?.description || '');
  const [deliveryType, setDeliveryType] = useState<'Internal' | 'External'>(documentToEdit?.deliveryType || 'Internal');
  
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

    if (isEditMode && onUpdateDocument) {
        const updatedDoc: Document = {
            ...documentToEdit,
            title,
            recipientOffice,
            description,
            deliveryType,
            category: aiSuggestion?.category || documentToEdit.category,
            priority: aiSuggestion?.priority || documentToEdit.priority,
            updatedAt: now,
        };
        onUpdateDocument(updatedDoc);
    } else if (!isEditMode && onAddDocument) {
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
    }
  };

  const formInputStyle = "mt-2 block w-full px-4 py-2.5 bg-white/40 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/50 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
  const formLabelStyle = "block text-sm font-semibold text-slate-700 dark:text-slate-300";

  return (
    <div className="p-4 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto bg-white/30 dark:bg-slate-900/40 backdrop-blur-lg p-6 sm:p-10 rounded-2xl shadow-lg border border-white/30 dark:border-slate-700/30">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{isEditMode ? 'Edit Document' : 'Create New Document'}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="title" className={formLabelStyle}>Document Title</label>
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={formInputStyle} required placeholder="e.g., Monthly Financial Report"/>
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
        </div>
        
        <div>
          <label htmlFor="description" className={formLabelStyle}>Description / Remarks</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} onBlur={handleDescriptionBlur} rows={5} className={formInputStyle} required placeholder="Provide a brief summary of the document's content..."/>
        </div>

        {isClassifying && <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">✨ Gemini is classifying your document...</div>}
        
        {aiSuggestion && (
            <div className="p-4 bg-sky-500/10 border-l-4 border-sky-400 dark:border-sky-600 rounded-r-lg">
                <h4 className="font-semibold text-sky-800 dark:text-sky-300">AI Suggestion ✨</h4>
                <p className="text-sm text-sky-700 dark:text-sky-400 mt-1">
                    Category: <span className="font-medium">{aiSuggestion.category}</span>, 
                    Priority: <span className="font-medium">{aiSuggestion.priority}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">These will be automatically saved with your document.</p>
            </div>
        )}

        <div>
            <label className={formLabelStyle}>Delivery Type</label>
            <div className="mt-2 flex gap-6">
                <label className="flex items-center">
                    <input type="radio" name="deliveryType" value="Internal" checked={deliveryType === 'Internal'} onChange={() => setDeliveryType('Internal')} className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-gray-300 dark:border-slate-500 bg-transparent" />
                    <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">Internal</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="deliveryType" value="External" checked={deliveryType === 'External'} onChange={() => setDeliveryType('External')} className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-gray-300 dark:border-slate-500 bg-transparent" />
                    <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">External</span>
                </label>
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-white/30 dark:border-slate-700/30">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white/40 rounded-lg hover:bg-white/60 dark:text-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/50">Cancel</button>
          <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg shadow-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
            {isEditMode ? 'Save Changes' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
};