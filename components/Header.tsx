import React, { useState } from 'react';
import { User } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onUserChange: (userId: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, allUsers, onUserChange, theme, onThemeToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelect = (userId: string) => {
    onUserChange(userId);
    setDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-end px-8 z-30">
        <div className="flex items-center gap-6">
            <button 
                onClick={onThemeToggle}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            <div className="relative">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.office} ({currentUser.role})</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </div>
                </div>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-50 border border-slate-200 dark:border-slate-600">
                        {allUsers.map(user => (
                            <a
                                key={user.id}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSelect(user.id);
                                }}
                                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                            >
                                {user.name} <span className="text-xs text-slate-500 dark:text-slate-400">({user.role})</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </header>
  );
};