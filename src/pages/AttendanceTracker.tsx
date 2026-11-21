import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
  Laptop,
  Briefcase,
  Play,
  Square,
  FileSpreadsheet,
  Filter,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const AttendanceTracker: React.FC = () => {
  const { currentUser, isManager } = useAuth();
  if (!currentUser) return null;
  const {
    attendance,
    todayAttendance,
    isClockedIn,
    clockInTime,
    elapsedSeconds,
    clockIn,
    clockOut,
    profiles,
    teamPresenceCount,
  } = useData();

  const [selectedLocation, setSelectedLocation] = useState('Bengaluru HQ');
  const [shiftNotes, setShiftNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Format stopwatch elapsed time (HH:MM:SS)
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockIn = async () => {
    await clockIn(selectedLocation, shiftNotes.trim() || undefined);
    setShiftNotes('');
  };

  const handleClockOut = async () => {
    await clockOut();
  };

  // Personal attendance records for current user
  const personalRecords = attendance.filter((a) => a.user_id === currentUser.id);

  // Profile lookup
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Today's company-wide attendance logs for managers
  const todayStr = new Date().toISOString().split('T')[0];
  const companyTodayAttendance = profiles.map((p) => {
    const log = attendance.find((a) => a.user_id === p.id && a.date === todayStr);
    return {
      profile: p,
      attendance: log,
    };
  });

  const filteredCompanyLogs = companyTodayAttendance.filter(({ profile, attendance }) => {
    if (deptFilter !== 'All' && profile.department !== deptFilter) return false;
    if (statusFilter === 'Present') return attendance && attendance.clock_in && !attendance.clock_out;
    if (statusFilter === 'Completed') return attendance && attendance.clock_out;
    if (statusFilter === 'Remote') return attendance && attendance.status === 'Remote';
    if (statusFilter === 'Not Clocked In') return !attendance;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Attendance Action Banner (Interactive for Employee & Manager) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Clock status & live timer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daily Work Log
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900">
                {formatTimer(elapsedSeconds)}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {isClockedIn ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    LIVE RUNNING SHIFT
                  </span>
                ) : todayAttendance?.clock_out ? (
                  <span className="text-slate-500">Shift Completed Today</span>
                ) : (
                  <span className="text-amber-600">Ready to Start Today's Shift</span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Clock-in time:{' '}
              <strong className="text-slate-700">
                {todayAttendance?.clock_in
                  ? new Date(todayAttendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </strong>{' '}
              &bull; Clock-out time:{' '}
              <strong className="text-slate-700">
                {todayAttendance?.clock_out
                  ? new Date(todayAttendance.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </strong>
            </p>
          </div>

          {/* Right: Location & 1-Click Clock-In / Clock-Out */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 max-w-md w-full space-y-3">
            {!todayAttendance?.clock_out && !isClockedIn && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Working Location</span>
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Bengaluru HQ">Bengaluru HQ (Office Floor 3)</option>
                    <option value="WFH - Remote Hub">Work From Home (Remote Hub)</option>
                    <option value="Client On-Site">Client On-Site (India Operations)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Shift Objectives / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={shiftNotes}
                    onChange={(e) => setShiftNotes(e.target.value)}
                    placeholder="e.g. Sprints, quarterly review, client call..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </>
            )}

            <div className="pt-1">
              {!isClockedIn && !todayAttendance?.clock_out && (
                <button
                  onClick={handleClockIn}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>1-Click Clock In for Today</span>
                </button>
              )}

              {isClockedIn && (
                <button
                  onClick={handleClockOut}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>1-Click Clock Out (Log Final Duration)</span>
                </button>
              )}

              {todayAttendance?.clock_out && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs font-medium">
                  ✓ Today's shift has been logged ({todayAttendance.work_duration_minutes} minutes).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* If Manager: Show Company-wide Daily Attendance Summary */}
      {isManager && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                  Manager Exclusive
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Company-Wide Daily Attendance Monitor
                </h3>
              </div>
              <p className="text-xs text-slate-500">Live employee shifts & presence breakdown</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="All">All Shift Statuses</option>
                <option value="Present">Present & Active</option>
                <option value="Completed">Shift Completed</option>
                <option value="Remote">Remote (WFH)</option>
                <option value="Not Clocked In">Not Clocked In Yet</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product Design">Product Design</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Finance & Payroll">Finance & Payroll</option>
              </select>
            </div>
          </div>

          {/* Company Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Shift Status</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanyLogs.map(({ profile, attendance }) => {
                    const isActive = attendance?.clock_in && !attendance?.clock_out;
                    const isCompleted = Boolean(attendance?.clock_out);

                    return (
                      <tr key={profile.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name)}&backgroundColor=4f46e5`}
                              alt={profile.full_name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-900">{profile.full_name}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{profile.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{profile.department}</td>
                        <td className="py-3 px-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Active Shift
                            </span>
                          ) : isCompleted ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                              Not Clocked In
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono">
                          {attendance?.clock_in
                            ? new Date(attendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono">
                          {attendance?.clock_out
                            ? new Date(attendance.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono">
                          {attendance?.work_duration_minutes
                            ? `${(attendance.work_duration_minutes / 60).toFixed(1)} hrs`
                            : isActive
                            ? 'Running...'
                            : '--'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{attendance?.location || 'Bengaluru HQ'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Employee Personal Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Personal Attendance History ({currentUser.full_name})
            </h3>
            <p className="text-xs text-slate-500">Verified Supabase PostgreSQL timestamp audit records</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {personalRecords.length} records logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Total Duration</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {personalRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                personalRecords.map((rec) => {
                  const hours = rec.work_duration_minutes
                    ? `${(rec.work_duration_minutes / 60).toFixed(1)} hrs`
                    : rec.clock_in && !rec.clock_out
                    ? 'In Progress'
                    : '--';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {new Date(rec.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            rec.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'Remote'
                              ? 'bg-indigo-100 text-indigo-800'
                              : rec.status === 'Overtime'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-mono">
                        {rec.clock_in
                          ? new Date(rec.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-mono">
                        {rec.clock_out
                          ? new Date(rec.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 font-mono">{hours}</td>
                      <td className="py-3 px-4 text-slate-600">{rec.location}</td>
                      <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                        {rec.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
