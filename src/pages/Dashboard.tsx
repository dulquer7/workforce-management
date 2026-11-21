import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  LifeBuoy,
  Users,
  ArrowUpRight,
  Clock3,
  Sparkles,
  TrendingUp,
  MapPin,
  CalendarDays,
  Shield,
  Zap,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ApplyLeaveModal } from '../components/modals/ApplyLeaveModal';
import { CreateTicketModal } from '../components/modals/CreateTicketModal';
import { TicketDetailsModal } from '../components/modals/TicketDetailsModal';
import { SupportTicket } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser, isManager } = useAuth();
  const {
    todayAttendance,
    isClockedIn,
    elapsedSeconds,
    clockIn,
    clockOut,
    userLeaveBalance,
    openTicketsCount,
    teamPresenceCount,
    reportingManager,
    activities,
    tickets,
  } = useData();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  if (!currentUser) return null;

  // Format stopwatch elapsed time (HH:MM:SS)
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isManager ? 'HR & Leadership Console' : 'Employee Self-Service'}</span>
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser.full_name}!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isManager
                ? `Overseeing ${teamPresenceCount.total} employees across your departments. Review pending leave applications and assign staff.`
                : `You are in the ${currentUser.department} department as ${currentUser.designation}.`}
            </p>

            {/* Reporting Manager Display for Employees (Requirement 3) */}
            {!isManager && (
              <div className="flex items-center gap-2 pt-2 text-xs border-t border-white/10 mt-2">
                <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="text-slate-300">
                  Assigned Reporting Manager:{' '}
                  {reportingManager ? (
                    <strong className="text-white font-bold underline decoration-indigo-400 decoration-2 underline-offset-2">
                      {reportingManager.full_name} ({reportingManager.designation})
                    </strong>
                  ) : (
                    <span className="text-amber-300 font-medium italic">
                      Unassigned — Contact your HR administrator
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Quick 1-Click Clock In/Out Action in Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Today's Shift Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-white">
                  {isClockedIn ? formatTimer(elapsedSeconds) : todayAttendance?.clock_out ? 'Shift Completed' : 'Not Clocked In'}
                </span>
                {isClockedIn && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isClockedIn && !todayAttendance?.clock_out && (
                <button
                  onClick={() => clockIn('Bengaluru HQ')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Clock In Now</span>
                </button>
              )}

              {isClockedIn && (
                <button
                  onClick={() => clockOut()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-1.5"
                >
                  <Clock3 className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('attendance')}
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                title="View full attendance sheet"
              >
                Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Attendance Shift Status */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Shift
            </span>
            <div className={`p-2.5 rounded-xl transition ${isClockedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {isClockedIn ? 'Active' : todayAttendance?.clock_out ? 'Completed' : 'Not Started'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>{todayAttendance?.location || 'Office HQ'}</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Tracker <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </p>
        </div>

        {/* KPI 2: Leave Balance */}
        <div
          onClick={() => onNavigate('leaves')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Leave Balance
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{userLeaveBalance}</span>
            <span className="text-xs font-semibold text-slate-500">Days Remaining</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Annual + Sick pool</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Apply <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </p>
        </div>

        {/* KPI 3: Open ITSM Tickets */}
        <div
          onClick={() => onNavigate('support')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Open ITSM Tickets
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{openTicketsCount}</span>
            <span className="text-xs font-semibold text-amber-600">In Active Queue</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>IT, Payroll, Facilities</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Support Desk <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </p>
        </div>

        {/* KPI 4: Team Presence */}
        <div
          onClick={() => onNavigate('directory')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Team Presence
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {teamPresenceCount.present + teamPresenceCount.remote}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / {teamPresenceCount.total} Working Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>{teamPresenceCount.remote} Remote &bull; {teamPresenceCount.onLeave} Leave</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Directory <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </p>
        </div>
      </div>

      {/* Main Grid: Quick Action Cards + Unified Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Quick Action Cards + Recent Tickets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: Apply for Leave */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-100 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md shadow-indigo-600/20">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Apply for Time Off</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Request annual leave, sick leave, or casual time off with manager approval workflow.
                </p>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Open Leave Request Form</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action 2: Raise ITSM Ticket */}
            <div className="bg-gradient-to-br from-violet-50/60 to-pink-50/40 border border-violet-100 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-3 shadow-md shadow-violet-600/20">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Internal Support Desk</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Fast-track requests for IT hardware, payroll queries, HR handbook, or office facilities.
                </p>
              </div>
              <button
                onClick={() => setShowTicketModal(true)}
                className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Submit Support Ticket</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Open Tickets Quick Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Support Desk Tickets</h3>
                <p className="text-xs text-slate-500">Transparent ticketing lifecycle tracking</p>
              </div>
              <button
                onClick={() => onNavigate('support')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all tickets <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No support tickets raised yet. Click "Submit Support Ticket" above whenever you need assistance.
              </div>
            ) : (
              <div className="space-y-2.5">
                {tickets.slice(0, 4).map((tick) => (
                  <div
                    key={tick.id}
                    onClick={() => setSelectedTicket(tick)}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {tick.ticket_number}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition">
                          {tick.subject}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {tick.category} &bull; Priority:{' '}
                          <span className={tick.priority === 'High' ? 'text-rose-600 font-bold' : ''}>
                            {tick.priority}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                        tick.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tick.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tick.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unified Live Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Unified Activity Feed</h3>
              <p className="text-xs text-slate-500">Live stream of leaves & ITSM tickets</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[520px] pr-1">
            {activities.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Clock3 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No recent activity</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Events will appear here as you submit leave requests, clock shifts, and raise support tickets.
                </p>
              </div>
            ) : (
              activities.map((item) => {
                const badgeColors = {
                  emerald: 'bg-emerald-100 text-emerald-800',
                  amber: 'bg-amber-100 text-amber-800',
                  rose: 'bg-rose-100 text-rose-800',
                  indigo: 'bg-indigo-100 text-indigo-800',
                  slate: 'bg-slate-100 text-slate-700',
                }[item.badgeVariant];

                return (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.author.avatar ? (
                          <img
                            src={item.author.avatar}
                            alt={item.author.name}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {item.author.name[0]}
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-800 truncate">{item.author.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeColors}`}>
                        {item.badgeText}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-snug">{item.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">{item.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplyLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
      <CreateTicketModal isOpen={showTicketModal} onClose={() => setShowTicketModal(false)} />
      <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
};
