


import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import { CreateDocumentForm } from './components/CreateDocumentForm';
import { DocumentDetail } from './components/DocumentDetail';
import { LoginPage } from './components/LoginPage';
import { SuperAdminPage } from './components/SuperAdminPage';
import { TrackDocumentModal } from './components/TrackDocumentModal';
import { ProfilePage } from './components/ProfilePage';
import { Document, Page, User, UserRole, DocumentStatus, DocumentHistory, Notification } from './types';
import { getDocuments, getUsers, addDocument, updateDocument, addUser, deleteUser, seedDatabase, updateUser, getOffices, addOffice, deleteOffice, uploadAvatar, getNotificationsForUser, addNotification, markNotificationAsRead, markAllNotificationsAsRead } from './services/supabaseService';
import { ConfirmationModal } from './components/ConfirmationModal';
import { NotificationToast } from './components/NotificationToast';


function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return 'dark';
    }
    return 'light';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [offices, setOffices] = useState<string[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
  });

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [printPreviewDoc, setPrintPreviewDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    isError?: boolean;
  }>({ isOpen: false, title: '', message: '' });
  
  const [notification, setNotification] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchData = async () => {
      setIsLoading(true);
      await seedDatabase(); 
      const [fetchedUsers, fetchedDocuments, fetchedOffices] = await Promise.all([
          getUsers(),
          getDocuments(),
          getOffices()
      ]);
      setUsers(fetchedUsers);
      setDocuments(fetchedDocuments.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      setOffices(fetchedOffices.map(o => o.name).sort());

      const savedUserStr = localStorage.getItem('currentUser');
      if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          const userNotifications = await getNotificationsForUser(savedUser.id);
          setNotifications(userNotifications);
      }

      setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      getNotificationsForUser(currentUser.id).then(setNotifications);
    } else {
      localStorage.removeItem('currentUser');
      setNotifications([]); // Clear notifications on logout
    }
  }, [currentUser]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ id: Date.now(), message, type });
  };

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar on navigation
    if (page !== 'detail' && page !== 'edit' && page !== 'profile') {
      setSelectedDocument(null);
    }
  };

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc);
    setCurrentPage('detail');
  };

  const handleAddDocument = async (doc: Document) => {
    const newDoc = await addDocument(doc);
    if (newDoc) {
        setDocuments(prevDocs => [newDoc, ...prevDocs]);
        handleDocumentSelect(newDoc);
        showNotification('Document created and saved as draft.');
    } else {
        setModalState({ isOpen: true, title: 'Save Failed', message: 'The document could not be saved to the database.', isError: true });
    }
  };

  const createAndDispatchNotifications = async (updatedDoc: Document, previousStatus: DocumentStatus) => {
      if (!currentUser) return;

      const newStatus = updatedDoc.status;
      const docTitle = updatedDoc.title.substring(0, 30);
      const notificationsToAdd: Omit<Notification, 'id' | 'created_at' | 'is_read'>[] = [];
      
      // Notify recipients when a document is sent or forwarded to their office
      if ((newStatus === DocumentStatus.SENT || newStatus === DocumentStatus.FORWARDED) && newStatus !== previousStatus) {
          const recipientUsers = users.filter(u => u.office === updatedDoc.recipientOffice && u.id !== currentUser.id);
          recipientUsers.forEach(user => {
              notificationsToAdd.push({
                  user_id: user.id,
                  document_id: updatedDoc.id,
                  message: `Document "${docTitle}..." was sent to your office by ${currentUser.name}.`
              });
          });
      }

      // Notify sender about progress
      if (updatedDoc.sender && updatedDoc.sender.id !== currentUser.id) {
          let message = '';
          if (newStatus === DocumentStatus.RECEIVED && newStatus !== previousStatus) {
              message = `Your document "${docTitle}..." was received by ${currentUser.name} at ${currentUser.office}.`;
          } else if (newStatus === DocumentStatus.APPROVED && newStatus !== previousStatus) {
              message = `Your document "${docTitle}..." was approved by ${currentUser.name}.`;
          } else if (newStatus === DocumentStatus.COMPLETED && newStatus !== previousStatus) {
              message = `Your document "${docTitle}..." has been marked as completed.`;
          } else if (newStatus === DocumentStatus.DISAPPROVED && newStatus !== previousStatus) {
              message = `Your document "${docTitle}..." was disapproved by ${currentUser.name}.`;
          }
          
          if (message) {
              notificationsToAdd.push({
                  user_id: updatedDoc.sender.id,
                  document_id: updatedDoc.id,
                  message: message
              });
          }
      }

      for (const notif of notificationsToAdd) {
          await addNotification(notif);
      }
  };

  const handleUpdateDocument = async (updatedDoc: Document) => {
    const originalDoc = documents.find(d => d.id === updatedDoc.id);
    const previousStatus = originalDoc ? originalDoc.status : updatedDoc.status;

    const result = await updateDocument(updatedDoc);
    if (result) {
        const newDocuments = documents.map(doc => (doc.id === updatedDoc.id ? result : doc));
        setDocuments(newDocuments);
        if (selectedDocument && selectedDocument.id === updatedDoc.id) {
            setSelectedDocument(result);
        }
        showNotification(`Status updated to "${result.status}".`);

        await createAndDispatchNotifications(result, previousStatus);
        
        if(currentUser) {
            const userNotifications = await getNotificationsForUser(currentUser.id);
            setNotifications(userNotifications);
        }
    }
  };
  
  const handleUpdateEditedDocument = async (doc: Document) => {
    const result = await updateDocument(doc);
    if (result) {
        const newDocuments = documents.map(d => (d.id === doc.id ? result : d));
        setDocuments(newDocuments);
        handleDocumentSelect(result); // Navigate back to detail page with updated doc
        showNotification('Document details saved successfully.');
    }
  };

  const handleEditRequest = (doc: Document) => {
    setSelectedDocument(doc);
    setCurrentPage('edit');
  };

  const handleAddUser = async (newUser: Omit<User, 'id' | 'avatar_url'>) => {
    const addedUser = await addUser(newUser);
    if (addedUser) {
        setUsers(prevUsers => [...prevUsers, addedUser]);
        showNotification(`User "${addedUser.name}" added successfully.`);
    } else {
        showNotification('Failed to add user.', 'error');
    }
  };

  const handleUpdateUser = async (userToUpdate: User, newAvatarFile?: File) => {
    let updatedUser = { ...userToUpdate };

    if (newAvatarFile) {
        try {
            const newAvatarUrl = await uploadAvatar(userToUpdate.id, newAvatarFile);
            updatedUser.avatar_url = newAvatarUrl;
        } catch (error) {
            setModalState({
                isOpen: true,
                title: 'Avatar Upload Failed',
                message: `The avatar could not be uploaded due to an error: "${error instanceof Error ? error.message : 'Unknown error'}". Your other profile changes will still be saved.`,
                isError: true,
            });
        }
    }
    
    const result = await updateUser(updatedUser);
    if (result) {
        setUsers(prevUsers => prevUsers.map(u => u.id === result.id ? result : u));
        
        // If the updated user is the current user, update their session
        if (currentUser && currentUser.id === result.id) {
            setCurrentUser(result);
        }
        
        showNotification('User profile updated.');
    } else {
        setModalState({
            isOpen: true,
            title: 'Update Failed',
            message: `Could not update user "${updatedUser.name}".`,
            isError: true,
        });
    }
  };

  const handleDeleteUserRequest = (user: User) => {
    setModalState({
        isOpen: true,
        title: 'Delete User Confirmation',
        message: `Are you sure you want to delete the user "${user.name}"? This action is permanent and cannot be undone.`,
        onConfirm: () => handleDeleteUser(user.id),
    });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
        await deleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        setDocuments(prevDocs => 
            prevDocs.map(doc => {
                if (doc.sender?.id === userId) {
                    return { ...doc, sender: null };
                }
                return doc;
            })
        );
        showNotification('User deleted successfully.');
    } catch (error) {
        setModalState({
            isOpen: true,
            title: 'Deletion Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred.',
            isError: true,
        });
    }
  };
  
  const handleAddOffice = async (officeName: string) => {
    if (offices.some(o => o.toLowerCase() === officeName.toLowerCase())) {
        showNotification(`Office "${officeName}" already exists.`, 'error');
        return;
    }
    try {
        const newOffice = await addOffice(officeName);
        setOffices(prev => [...prev, newOffice.name].sort());
        showNotification(`Office "${newOffice.name}" added.`);
    } catch (error) {
        let title = 'Failed to Add Office';
        let message = error instanceof Error ? error.message : 'An unknown error occurred.';
        if (error instanceof Error && error.message.includes('violates row-level security policy')) {
            title = 'Database Permission Error';
            message = `The action was blocked by a database security rule. The current policy for the 'offices' table requires a logged-in user, but the application is operating anonymously. To fix this, please go to your Supabase SQL Editor and update the policy to grant INSERT permission to the 'anon' role.`;
        }
        setModalState({ isOpen: true, title, message, isError: true });
    }
  };

  const handleDeleteOfficeRequest = (officeName: string) => {
    setModalState({
        isOpen: true,
        title: 'Delete Office Confirmation',
        message: `Are you sure you want to delete the office "${officeName}"? This action cannot be undone.`,
        onConfirm: () => handleDeleteOffice(officeName),
    });
  };

  const handleDeleteOffice = async (officeName: string) => {
    try {
        await deleteOffice(officeName);
        setOffices(prev => prev.filter(o => o !== officeName));
        showNotification(`Office "${officeName}" has been deleted.`);
    } catch (error) {
        let title = 'Deletion Failed';
        let message = error instanceof Error ? error.message : 'An unknown error occurred.';
         if (error instanceof Error && error.message.includes('violates row-level security policy')) {
            title = 'Database Permission Error';
            message = `The action was blocked by a database security rule. The current policy for the 'offices' table requires a logged-in user, but the application is operating anonymously. To fix this, please go to your Supabase SQL Editor and update the policy to grant DELETE permission to the 'anon' role.`;
        }
        setModalState({ isOpen: true, title, message, isError: true });
    }
  };

  const handlePrintRequest = (doc: Document) => {
    setPrintPreviewDoc(doc);
  };
  
  const handleActualPrint = () => {
    window.print();
  };
  
  const handleTrackByNumber = async (trackingNumber: string) => {
    const doc = documents.find(d => d.trackingNumber === trackingNumber.trim());
    if (doc) {
        if (
            currentUser &&
            doc.status === DocumentStatus.SENT &&
            doc.recipientOffice === currentUser.office
        ) {
            const now = new Date().toISOString();
            const historyEntry: DocumentHistory = {
                id: `h-${Date.now()}`,
                timestamp: now,
                action: 'Received',
                user: currentUser,
                office: currentUser.office,
                remarks: `Received via QR Scan/Manual Track from ${doc.history[0]?.office || doc.sender?.office || 'previous office'}.`,
            };
            const updatedDoc: Document = {
                ...doc,
                status: DocumentStatus.RECEIVED,
                updatedAt: now,
                history: [historyEntry, ...doc.history],
            };
            await handleUpdateDocument(updatedDoc);
            handleDocumentSelect(updatedDoc);
            showNotification('Document automatically received!');
        } else {
            handleDocumentSelect(doc);
        }
    } else {
        setModalState({
            isOpen: true,
            title: 'Document Not Found',
            message: `No document with the tracking number "${trackingNumber}" could be found.`,
            isError: true,
        });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
      const doc = documents.find(d => d.id === notification.document_id);
      if (doc) {
          handleDocumentSelect(doc);
      }
      if (!notification.is_read) {
          await markNotificationAsRead(notification.id);
          setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      }
  };

  const handleMarkAllAsRead = async () => {
      if (!currentUser) return;
      await markAllNotificationsAsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };


  const filteredDocuments = useMemo(() => {
    let userFilteredDocs: Document[] = [];
    if (!currentUser) return [];

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      userFilteredDocs = documents; // Super Admin sees everything
    } else {
      userFilteredDocs = documents.filter(doc => {
        // Users always see documents they created
        if (doc.sender?.id === currentUser.id) {
          return true;
        }
        
        // Users see documents currently at their office for action,
        // but not if the status is just 'Sent'. It must be received first.
        const isAtMyOffice = doc.recipientOffice === currentUser.office;
        if (isAtMyOffice && doc.status !== DocumentStatus.SENT) {
          return true;
        }

        return false;
      });
    }
    
    if (!searchQuery) {
        return userFilteredDocs;
    }

    const lowercasedQuery = searchQuery.toLowerCase().trim();
    return userFilteredDocs.filter(doc => 
        doc.title.toLowerCase().includes(lowercasedQuery) ||
        doc.description.toLowerCase().includes(lowercasedQuery) ||
        doc.trackingNumber.toLowerCase().includes(lowercasedQuery) ||
        (doc.sender?.name || '').toLowerCase().includes(lowercasedQuery)
    );
  }, [documents, currentUser, searchQuery]);


  const renderContent = () => {
    if (!currentUser) return null;
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard documents={filteredDocuments} onDocumentSelect={handleDocumentSelect} />;
      case 'documents':
        return (
            <div className="p-4 sm:p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Documents</h1>
                    <p className="mt-1 text-md text-slate-600 dark:text-slate-400">Browse and manage all your accessible documents.</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title, tracking #, sender..."
                        className="block w-full pl-12 pr-3 py-3 border border-white/30 dark:border-slate-700/30 rounded-xl leading-5 bg-white/40 dark:bg-slate-800/50 text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                </div>
                <DocumentList documents={filteredDocuments} onDocumentSelect={handleDocumentSelect} />
            </div>
        );
      case 'create':
        return <CreateDocumentForm currentUser={currentUser} onAddDocument={handleAddDocument} onCancel={() => handleNavigate('dashboard')} allOffices={offices.filter(o => o !== currentUser.office)} />;
      case 'edit':
        if (selectedDocument) {
          return <CreateDocumentForm 
                    currentUser={currentUser} 
                    onUpdateDocument={handleUpdateEditedDocument} 
                    onCancel={() => handleDocumentSelect(selectedDocument)} 
                    allOffices={offices.filter(o => o !== currentUser.office)}
                    documentToEdit={selectedDocument} 
                 />;
        }
        return null;
      case 'detail':
        if (selectedDocument) {
          return <DocumentDetail 
                    document={selectedDocument} 
                    currentUser={currentUser} 
                    onUpdateDocument={handleUpdateDocument} 
                    onBack={() => handleNavigate('documents')} 
                    allOffices={offices}
                    onPrintRequest={handlePrintRequest}
                    onEditRequest={handleEditRequest}
                 />;
        }
        return null; 
       case 'profile':
        return <ProfilePage currentUser={currentUser} onUpdateUser={handleUpdateUser} onBack={() => handleNavigate('dashboard')} />;
      case 'superadmin':
        if (currentUser.role !== UserRole.SUPER_ADMIN) {
            return <Dashboard documents={filteredDocuments} onDocumentSelect={handleDocumentSelect} />;
        }
        return <SuperAdminPage
            allUsers={users}
            allDocuments={documents}
            allOffices={offices}
            onAddUser={handleAddUser}
            onDeleteUserRequest={handleDeleteUserRequest}
            onUpdateUser={handleUpdateUser}
            onAddOffice={handleAddOffice}
            onDeleteOfficeRequest={handleDeleteOfficeRequest}
        />;
      default:
        return <Dashboard documents={filteredDocuments} onDocumentSelect={handleDocumentSelect} />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-200 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <img src="/darlogo.png" alt="DAR Logo" className="h-20 w-20 animate-pulse" />
            <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">Loading Application...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginPage 
            onLogin={handleLogin} 
            users={users} 
        />
        <ConfirmationModal
            isOpen={modalState.isOpen}
            title={modalState.title}
            message={modalState.message}
            onCancel={() => setModalState({ isOpen: false, title: '', message: '' })}
            isError={modalState.isError}
        />
      </>
    );
  }

  return (
    <div className="bg-transparent text-slate-900 dark:text-slate-300 min-h-screen font-sans">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
      />
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onMenuClick={() => setIsSidebarOpen(true)}
        onTrackClick={() => setIsTrackingModalOpen(true)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
        onProfileClick={() => handleNavigate('profile')}
      />
      <main className="lg:ml-72 pt-20">
        {renderContent()}
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
          <div 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              aria-hidden="true"
          ></div>
      )}

      {/* Document Tracking Modal */}
      {isTrackingModalOpen && (
          <TrackDocumentModal 
              isOpen={isTrackingModalOpen}
              onClose={() => setIsTrackingModalOpen(false)}
              onManualSubmit={(trackingNumber) => {
                  setIsTrackingModalOpen(false);
                  handleTrackByNumber(trackingNumber);
              }}
          />
      )}

      {/* Universal Confirmation and Alert Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={() => setModalState({ isOpen: false, title: '', message: '' })}
        confirmText="Delete"
        isError={modalState.isError}
      />

      {/* Print Preview Modal */}
      {printPreviewDoc && (
        <div id="print-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-auto">
            <div id="print-modal-content" className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-lg shadow-xl w-full max-w-4xl border border-white/30 dark:border-slate-700/30">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Print QR Code</h3>
                    <button onClick={() => setPrintPreviewDoc(null)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">&times;</button>
                </div>
                
                <div className="printable-area p-4 bg-white rounded-md">
                    <div className="qr-container">
                         <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(printPreviewDoc.trackingNumber)}`} 
                            alt="QR Code"
                        />
                        <p className="font-mono text-sm mt-1">{printPreviewDoc.trackingNumber}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-4 border-t border-white/30 dark:border-slate-600/50 pt-4">
                    <button onClick={() => setPrintPreviewDoc(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white/40 rounded-lg hover:bg-white/60 dark:text-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/50">Close</button>
                    <button onClick={handleActualPrint} className="px-6 py-2 text-sm font-medium text-white bg-sky-600 rounded-md shadow-lg hover:bg-sky-700">Print Now</button>
                </div>
            </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;