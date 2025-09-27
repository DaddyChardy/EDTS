import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import { CreateDocumentForm } from './components/CreateDocumentForm';
import { DocumentDetail } from './components/DocumentDetail';
import { LoginPage } from './components/LoginPage';
import { SuperAdminPage } from './components/SuperAdminPage';
import { OFFICES } from './constants';
import { Document, Page, User, UserRole } from './types';
import { getDocuments, getUsers, addDocument, updateDocument, addUser, deleteUser, seedDatabase } from './services/supabaseService';
import { ConfirmationModal } from './components/ConfirmationModal';


function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (localStorage.getItem('theme') === 'dark') return 'dark';
    if (localStorage.getItem('theme') === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
  });

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [printPreviewDoc, setPrintPreviewDoc] = useState<Document | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    isError?: boolean;
  }>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        // Ensure the database is seeded with initial users if it's empty
        await seedDatabase(); 
        const [fetchedUsers, fetchedDocuments] = await Promise.all([
            getUsers(),
            getDocuments()
        ]);
        setUsers(fetchedUsers);
        setDocuments(fetchedDocuments.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

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
    if (page !== 'detail') {
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
        handleDocumentSelect(newDoc); // Go to detail view after creating
    }
  };

  const handleUpdateDocument = async (updatedDoc: Document) => {
    const result = await updateDocument(updatedDoc);
    if (result) {
        setDocuments(prevDocs => prevDocs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc)));
        // If the detail view is open for this doc, update it.
        if (selectedDocument && selectedDocument.id === updatedDoc.id) {
            setSelectedDocument(updatedDoc);
        }
    }
  };

  const handleAddUser = async (newUser: Omit<User, 'id'>) => {
    const addedUser = await addUser(newUser);
    if (addedUser) {
        setUsers(prevUsers => [...prevUsers, addedUser]);
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
    } catch (error) {
        setModalState({
            isOpen: true,
            title: 'Deletion Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred.',
            isError: true,
        });
    }
  };
  
  const handlePrintRequest = (doc: Document) => {
    setPrintPreviewDoc(doc);
  };
  
  const handleActualPrint = () => {
    window.print();
  };

  const filteredDocuments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) {
      return documents; // Admin and Super Admin see everything
    }
    
    return documents.filter(doc => {
      // Users always see documents they created
      if (doc.sender?.id === currentUser.id) {
        return true;
      }
      
      // Users see documents currently at their office for action
      const isAtMyOffice = doc.recipientOffice === currentUser.office;
      if (isAtMyOffice) {
        return true;
      }

      return false;
    });
  }, [documents, currentUser]);


  const renderContent = () => {
    if (!currentUser) return null;
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard documents={filteredDocuments} onDocumentSelect={handleDocumentSelect} />;
      case 'documents':
        return <div className="p-4 sm:p-8"><DocumentList documents={filteredDocuments} onDocumentSelect={handleDocumentSelect} /></div>;
      case 'create':
        return <CreateDocumentForm currentUser={currentUser} onAddDocument={handleAddDocument} onCancel={() => handleNavigate('dashboard')} allOffices={OFFICES.filter(o => o !== currentUser.office)} />;
      case 'detail':
        if (selectedDocument) {
          return <DocumentDetail 
                    document={selectedDocument} 
                    currentUser={currentUser} 
                    onUpdateDocument={handleUpdateDocument} 
                    onBack={() => handleNavigate('documents')} 
                    allOffices={OFFICES}
                    onPrintRequest={handlePrintRequest}
                 />;
        }
        return null; 
      case 'superadmin':
        if (currentUser.role !== UserRole.SUPER_ADMIN) {
            return <Dashboard documents={filteredDocuments} onDocumentSelect={handleDocumentSelect} />;
        }
        return <SuperAdminPage
            allUsers={users}
            allDocuments={documents}
            onAddUser={handleAddUser}
            onDeleteUserRequest={handleDeleteUserRequest}
        />;
      default:
        return <Dashboard documents={filteredDocuments} onDocumentSelect={handleDocumentSelect} />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">Loading Application...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen">
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
      />
      <main className="lg:ml-64 pt-16">
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
        <div id="print-overlay" className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div id="print-modal-content" className="relative bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Print QR Code</h3>
                    <button onClick={() => setPrintPreviewDoc(null)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">&times;</button>
                </div>
                
                <div className="printable-area border-t border-slate-200 dark:border-slate-600 pt-4 text-center">
                    <div className="flex gap-4 items-center p-2 text-left">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(printPreviewDoc.trackingNumber)}`} 
                            alt="QR Code" 
                            className="border p-1 bg-white"
                        />
                        <div className="font-mono text-sm text-slate-800 dark:text-slate-200">
                            <p className="font-sans font-semibold">Document Tracking No</p>
                            <p>{new Date(printPreviewDoc.createdAt).toLocaleDateString()}</p>
                            <p>{printPreviewDoc.trackingNumber}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-600 pt-4">
                    <button onClick={() => setPrintPreviewDoc(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">Close</button>
                    <button onClick={handleActualPrint} className="px-6 py-2 text-sm font-medium text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700">Print Now</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;