import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MenuIcon } from './icons/MenuIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { ProfileIcon } from './icons/ProfileIcon';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onMenuClick: () => void;
  onTrackClick: () => void;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, theme, onThemeToggle, onMenuClick, onTrackClick, onProfileClick }) => {
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
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-30">
        <button 
            onClick={onMenuClick}
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Open sidebar"
        >
            <MenuIcon className="w-6 h-6" />
        </button>

        <div className="flex-grow"></div>

        <div className="flex items-center gap-2 sm:gap-4">
            <button 
                onClick={onTrackClick}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Track Document"
            >
                <QrCodeIcon className="w-6 h-6" />
            </button>
            <button 
                onClick={onThemeToggle}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 sm:gap-4 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 ring-sky-500 overflow-hidden">
                        {currentUser.avatar_url ? (
                            <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        )}
                    </div>
                     <div className="text-left hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.position}</p>
                    </div>
                </button>
                
                {isDropdownOpen && (
                     <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg py-2 border border-slate-200 dark:border-slate-700">
                        <div className="sm:hidden px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                           <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.position}</p>
                        </div>
                         <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onProfileClick();
                                setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <ProfileIcon className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400" />
                            My Profile
                        </a>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onLogout();
                                setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <LogoutIcon className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400" />
                            Logout
                        </a>
                    </div>
                )}
            </div>
        </div>
    </header>
  );
};