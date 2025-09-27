import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, theme, onThemeToggle, onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-8 z-30">
        <button 
            onClick={onMenuClick}
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Open sidebar"
        >
            <MenuIcon className="w-6 h-6" />
        </button>

        <div className="flex-grow"></div>

        <div className="flex items-center gap-4 sm:gap-6">
            <button 
                onClick={onThemeToggle}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 sm:gap-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.office} ({currentUser.role})</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </div>
                </button>
                
                {isDropdownOpen && (
                     <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700">
                        <div className="sm:hidden px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                           <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.office}</p>
                        </div>
                        <button
                            onClick={() => {
                                onLogout();
                                setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <LogoutIcon className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    </header>
  );
};
