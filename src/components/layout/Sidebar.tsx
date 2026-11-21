import React from 'react';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  LifeBuoy,
  Users,
  Shield,
  UserCheck,
  Briefcase,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { currentUser, isManager, signOut } = useAuth();
  const { isClockedIn, leaves, tickets, userLeaveBalance } = useData();

  if (!currentUser) return null;

  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'attendance',
      label: 'Attendance Tracker',
      icon: Clock,
      badge: isClockedIn ? (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      ) : null,
    },
    {
      id: 'leaves',
      label: isManager ? 'Leave Requests' : 'My Leaves',
      icon: CalendarDays,
      badge: isManager && pendingLeavesCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
          {pendingLeavesCount}
        </span>
      ) : !isManager ? (
        <span className="text-[10px] text-slate-400 font-mono">
          {userLeaveBalance}d left
        </span>
      ) : null,
    },
    {
      id: 'support',
      label: 'Support Desk (ITSM)',
      icon: LifeBuoy,
      badge: openTicketsCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
          {openTicketsCount}
        </span>
      ) : null,
    },
    {
      id: 'directory',
      label: isManager ? 'Team & Assignments' : 'Employee Directory',
      icon: Users,
      badge: null,
    },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  SemilWork
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Workforce & Support ITSM</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Logged in as
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isManager
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              }`}
            >
              {isManager ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              {isManager ? 'HR / Manager' : 'Employee'}
            </span>
          </div>
          <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
          <p className="text-[11px] text-slate-400 truncate">{currentUser.designation}</p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </button>
            );
          })}
        </div>

        {/* Clean Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 text-slate-300 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
