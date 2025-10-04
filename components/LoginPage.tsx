import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (userId: string) => void;
  users: User[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onLogin(selectedUserId);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
            <div className="flex flex-col items-center justify-center mb-4">
                <img src="https://images.seeklogo.com/logo-png/35/1/department-of-agrarian-reform-logo-png_seeklogo-354283.png" alt="DAR Logo" className="h-20 w-20 mb-4" />
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">DAR EDTS</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enterprise Document Tracking System</p>
                <p className="text-xs text-slate-400 dark:text-slate-300 mt-2">Surigao Del Sur Provincial Office</p>
            </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Please select your profile to continue</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select Profile
            </label>
            <select
              id="user-select"
              name="user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
            >
              <option className="text-white" value="" disabled>-- Choose a user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.office})
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={!selectedUserId}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};