import React, { useState, useRef } from 'react';
import { User } from '../types';
import { UserIcon } from './icons/UserIcon';
import { PencilIcon } from './icons/PencilIcon';

interface ProfilePageProps {
  currentUser: User;
  onUpdateUser: (user: User, newAvatarFile?: File) => void;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onUpdateUser, onBack }) => {
  const [name, setName] = useState(currentUser.name);
  const [position, setPosition] = useState(currentUser.position);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    const updatedUser: User = {
        ...currentUser,
        name,
        position,
    };

    // The onUpdateUser function in App.tsx will handle the upload and URL update
    await onUpdateUser(updatedUser, newAvatarFile || undefined);
    
    setIsUploading(false);
    // Optionally, navigate back or show a success message
    // The App component handles showing the notification
    onBack();
  };
  
  const formInputStyle = "mt-2 block w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-400 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
  const formLabelStyle = "block text-sm font-semibold text-slate-700 dark:text-slate-300";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-6 text-sm font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-2">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back to Dashboard
      </button>
      <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Profile</h1>
        <form onSubmit={handleSaveChanges} className="mt-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              {previewUrl || currentUser.avatar_url ? (
                <img src={previewUrl || currentUser.avatar_url} alt="Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900/50 ring-sky-500" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900/50 ring-sky-500">
                    <UserIcon className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-700 p-2 rounded-full shadow-md border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                aria-label="Change profile picture"
              >
                <PencilIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</h2>
              <p className="text-md text-slate-500 dark:text-slate-400">{currentUser.position} - {currentUser.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="name" className={formLabelStyle}>Full Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={formInputStyle} required />
            </div>
            <div>
              <label htmlFor="position" className={formLabelStyle}>Position / Job Title</label>
              <input type="text" id="position" value={position} onChange={(e) => setPosition(e.target.value)} className={formInputStyle} required />
            </div>
            <div>
              <label className={formLabelStyle}>Office</label>
              <input type="text" value={currentUser.office} className={`${formInputStyle} bg-slate-100 dark:bg-slate-800 cursor-not-allowed`} disabled />
            </div>
             <div>
              <label className={formLabelStyle}>Role</label>
              <input type="text" value={currentUser.role} className={`${formInputStyle} bg-slate-100 dark:bg-slate-800 cursor-not-allowed`} disabled />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onBack} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">Cancel</button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
              disabled={isUploading}
            >
              {isUploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};