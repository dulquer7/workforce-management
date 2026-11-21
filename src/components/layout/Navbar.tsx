import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Menu, LogOut, Shield, UserCheck } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTab }) => {
  const { currentUser, isManager, signOut } = useAuth();
  const { isClockedIn } = useData();

  if (!currentUser) return null;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return isManager ? 'HR & Leadership Dashboard' : 'Employee Overview';
      case 'attendance':
        return 'Attendance Tracker';
      case 'leaves':
        return isManager ? 'Leave Requests & Approvals' : 'My Leave Requests';
      case 'support':
        return 'Internal Support Desk (ITSM)';
      case 'directory':
        return isManager ? 'Team & Assignments' : 'Employee Directory';
      default:
        return 'Workforce Portal';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left section: Hamburger (mobile) + Page Title + Live Clocked-in Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h1>

              {/* Real Clock-in Pulse Indicator */}
              {isClockedIn && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold animate-pulse-subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Clocked In</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {currentUser.department} &bull; {currentUser.designation}
            </p>
          </div>
        </div>

        {/* Right section: ONLY User Name, Role Badge, and Clean Logout Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-1.5 shadow-sm">
            <img
              src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.full_name)}&backgroundColor=4f46e5`}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.full_name}
              </p>
              <div className="mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                    isManager
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {isManager ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  {isManager ? 'HR / Manager' : 'Employee'}
                </span>
              </div>
            </div>
          </div>

          {/* Clean Logout Button */}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition shadow-sm"
            title="Sign Out of SemilWork"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
