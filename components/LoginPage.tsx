
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
            <div className="flex items-center justify-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-sky-600 mr-3">
                    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                    <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.914 9H3.087zm6.133 2.845a.75.75 0 011.06 0l1.72 1.72a.75.75 0 101.06-1.06l-1.72-1.72a.75.75 0 00-1.06 0l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">eDTS Tandag</h1>
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
              <option value="" disabled>-- Choose a user --</option>
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