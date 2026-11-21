import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AttendanceTracker } from './pages/AttendanceTracker';
import { LeaveManagement } from './pages/LeaveManagement';
import { SupportDesk } from './pages/SupportDesk';
import { EmployeeDirectory } from './pages/EmployeeDirectory';
import { AuthPage } from './pages/AuthPage';
import { Briefcase } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, loadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Loading state
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-white mb-4 animate-pulse">
          <Briefcase className="w-7 h-7 text-indigo-400" />
        </div>
        <p className="text-sm font-bold text-slate-300">Loading SemilWork Workspace...</p>
      </div>
    );
  }

  // If no user is authenticated, display the Sign In / Sign Up Gateway
  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* SaaS Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          activeTab={activeTab}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'attendance' && <AttendanceTracker />}
          {activeTab === 'leaves' && <LeaveManagement />}
          {activeTab === 'support' && <SupportDesk />}
          {activeTab === 'directory' && <EmployeeDirectory />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
