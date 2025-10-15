
import React from 'react';
import { Page, User, UserRole } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ShieldIcon } from './icons/ShieldIcon';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-white/10 group transition-colors duration-200 ${isActive ? 'bg-sky-500/20 text-sky-800 dark:text-white font-semibold' : ''}`}
    >
      {icon}
      <span className="ms-4 text-base">{label}</span>
    </a>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose, currentUser }) => {
  return (
    <aside 
      className={`fixed top-0 left-0 z-50 w-72 h-screen transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} 
      aria-label="Sidebar"
    >
      <div className="h-full px-4 py-6 overflow-y-auto bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl border-r border-white/30 dark:border-slate-700/30">
        <div className="flex items-center justify-between ps-2.5 mb-8">
            <div className="flex items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Department_of_Agrarian_Reform_%28DAR%29.svg/490px-Department_of_Agrarian_Reform_%28DAR%29.svg.png?20170204121737" alt="DAR Logo" className="h-10 w-10 mr-3" />
                <span className="self-center text-xl font-bold whitespace-nowrap text-slate-800 dark:text-white">DAR EDTS</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                <CloseIcon className="w-6 h-6" />
                <span className="sr-only">Close sidebar</span>
            </button>
        </div>
        <ul className="space-y-3 font-medium">
          <NavItem
            icon={<DashboardIcon className="w-6 h-6 text-slate-600 transition duration-75 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white" />}
            label="Dashboard"
            isActive={currentPage === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
          />
          <NavItem
            icon={<DocumentIcon className="w-6 h-6 text-slate-600 transition duration-75 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white" />}
            label="Documents"
            isActive={currentPage === 'documents'}
            onClick={() => onNavigate('documents')}
          />
          {currentUser.role === UserRole.SUPER_ADMIN && (
             <NavItem
                icon={<ShieldIcon className="w-6 h-6 text-slate-600 transition duration-75 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white" />}
                label="Super Admin"
                isActive={currentPage === 'superadmin'}
                onClick={() => onNavigate('superadmin')}
              />
          )}
        </ul>
        <div className="mt-10">
            <button 
                onClick={() => onNavigate('create')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-md font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 dark:focus:ring-sky-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
                <PlusIcon className="w-5 h-5"/>
                Create Document
            </button>
        </div>
      </div>
    </aside>
  );
};