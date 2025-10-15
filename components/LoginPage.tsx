









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
    <main className="w-full h-screen flex items-center justify-center bg-transparent p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Department_of_Agrarian_Reform_%28DAR%29.svg/490px-Department_of_Agrarian_Reform_%28DAR%29.svg.png?20170204121737" alt="DAR Logo" className="h-24 w-24 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">DAR EDTS</h1>
                <p className="text-md text-slate-600 dark:text-slate-300 mt-1">Enterprise Document Tracking System</p>
            </div>
            
            <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 dark:border-slate-700/30">
                <h2 className="text-xl font-semibold text-center text-slate-800 dark:text-slate-200 mb-1">Welcome Back</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">Please select your profile to sign in.</p>

                <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                    <label htmlFor="user-select" className="sr-only">Select Profile</label>
                    <select
                      id="user-select"
                      name="user"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mt-1 block w-full px-4 py-3 text-base border-white/30 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/50 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-xl"
                    >
                      <option value="" disabled>-- Choose a user --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} - {user.position} ({user.office})
                        </option>
                      ))}
                    </select>
                </div>
                <div>
                    <button
                      type="submit"
                      disabled={!selectedUserId}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Sign In
                    </button>
                </div>
                </form>
                 <p className="text-xs text-slate-500 dark:text-slate-500 mt-6 text-center">
                    Surigao Del Sur Provincial Office
                 </p>
            </div>
        </div>
    </main>
  );
};