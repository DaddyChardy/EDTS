import React, { useState, useRef, useEffect } from 'react';
import { User, Notification } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MenuIcon } from './icons/MenuIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { ProfileIcon } from './icons/ProfileIcon';
import { BellIcon } from './icons/BellIcon';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onMenuClick: () => void;
  onTrackClick: () => void;
  onProfileClick: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, theme, onThemeToggle, onMenuClick, onTrackClick, onProfileClick, notifications, onNotificationClick, onMarkAllAsRead }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-20 bg-white/20 dark:bg-slate-900/30 backdrop-blur-xl border-b border-white/30 dark:border-slate-700/30 flex items-center justify-between px-4 sm:px-8 z-30">
        <div className="flex items-center gap-4">
            <button 
                onClick={onMenuClick}
                className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
                aria-label="Open sidebar"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
                <img src="/darlogo.png" alt="DAR Logo" className="h-8 w-8" />
                <span className="font-bold text-lg text-slate-800 dark:text-white">DAR EDTS</span>
            </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
            <button 
                onClick={onTrackClick}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-black/20 transition-colors"
                aria-label="Track Document"
            >
                <QrCodeIcon className="w-6 h-6" />
            </button>
            <button 
                onClick={onThemeToggle}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-black/20"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
                <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-black/20 transition-colors relative"
                    aria-label="View notifications"
                >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white/30 dark:ring-slate-900/30"></span>
                    )}
                </button>
                {isNotificationOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/50 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 dark:border-slate-700/30 max-h-[70vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-white/30 dark:border-slate-700/30">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={() => { onMarkAllAsRead(); setIsNotificationOpen(false); }} className="text-xs font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">
                                    Mark all as read
                                </button>
                            )}
                        </div>
                        <ul className="flex-grow overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <li key={n.id} className={`${!n.is_read ? 'bg-sky-500/10' : ''}`}>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onNotificationClick(n);
                                            setIsNotificationOpen(false);
                                        }}
                                        className="block p-4 hover:bg-white/20 dark:hover:bg-black/10 border-b border-white/30 dark:border-slate-700/30 last:border-b-0"
                                    >
                                        <p className={`text-sm text-slate-700 dark:text-slate-300 ${!n.is_read ? 'font-semibold' : 'font-normal'}`}>{n.message}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                    </a>
                                </li>
                            )) : (
                                <li className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                    You have no notifications.
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 sm:gap-4 p-1 rounded-full hover:bg-white/30 dark:hover:bg-black/20 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <div className="w-10 h-10 rounded-full bg-white/30 dark:bg-slate-700/50 flex items-center justify-center ring-2 ring-offset-2 ring-offset-white/20 dark:ring-offset-slate-900/30 ring-sky-500 overflow-hidden">
                        {currentUser.avatar_url ? (
                            <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        )}
                    </div>
                     <div className="text-left hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.position}</p>
                    </div>
                </button>
                
                {isDropdownOpen && (
                     <div className="absolute right-0 mt-3 w-56 bg-white/50 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl shadow-2xl py-2 border border-white/30 dark:border-slate-700/30">
                        <div className="sm:hidden px-4 py-2 border-b border-white/30 dark:border-slate-700/30">
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
                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-black/20"
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
                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-black/20"
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