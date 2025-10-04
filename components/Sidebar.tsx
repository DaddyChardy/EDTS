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
      className={`flex items-center p-3 rounded-lg text-slate-900 hover:bg-sky-100 dark:text-white dark:hover:bg-slate-700 group ${isActive ? 'bg-sky-100 dark:bg-slate-700 font-semibold' : ''}`}
    >
      {icon}
      <span className="ms-3">{label}</span>
    </a>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose, currentUser }) => {
  return (
    <aside 
      className={`fixed top-0 left-0 z-50 w-64 h-screen transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} 
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between ps-2.5 mb-5">
            <div className="flex items-center">
                <img src="https://images.seeklogo.com/logo-png/35/1/department-of-agrarian-reform-logo-png_seeklogo-354283.png" alt="DAR SDS Logo" className="h-10 w-10 mr-3" />
                <span className="self-center text-xl font-semibold whitespace-nowrap text-slate-800 dark:text-white">DAR EDTS</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                <CloseIcon className="w-6 h-6" />
                <span className="sr-only">Close sidebar</span>
            </button>
        </div>
        <ul className="space-y-2 font-medium">
          <NavItem
            icon={<DashboardIcon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />}
            label="Dashboard"
            isActive={currentPage === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
          />
          <NavItem
            icon={<DocumentIcon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />}
            label="Documents"
            isActive={currentPage === 'documents'}
            onClick={() => onNavigate('documents')}
          />
          {currentUser.role === UserRole.SUPER_ADMIN && (
             <NavItem
                icon={<ShieldIcon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />}
                label="Super Admin"
                isActive={currentPage === 'superadmin'}
                onClick={() => onNavigate('superadmin')}
              />
          )}
        </ul>
        <div className="mt-8">
            <button 
                onClick={() => onNavigate('create')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
            >
                <PlusIcon className="w-5 h-5"/>
                Create Document
            </button>
        </div>
      </div>
    </aside>
  );
};