import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ShieldAlert,
  User,
  Filter,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ApplyLeaveModal } from '../components/modals/ApplyLeaveModal';
import { LeaveReviewModal } from '../components/modals/LeaveReviewModal';
import { LeaveRequest } from '../types';

export const LeaveManagement: React.FC = () => {
  const { currentUser, isManager } = useAuth();
  if (!currentUser) return null;
  const { leaves, reviewLeave, userLeaveBalance, profiles } = useData();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Pending leaves awaiting manager action
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  // Filtered leaves list for the history view
  const filteredLeaves = leaves.filter((l) => {
    // If not manager, only show own requests
    if (!isManager && l.user_id !== currentUser.id) return false;
    if (statusFilter !== 'All' && l.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Available Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between border border-indigo-800">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Annual Time-off Entitlement
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                FY 2026-27
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{userLeaveBalance}</span>
              <span className="text-xs text-indigo-200 font-medium">Days Remaining</span>
            </div>
            <p className="text-xs text-indigo-300/90 mt-2">
              Pool includes Annual, Sick, and Casual allowances with automatic balance deduction upon managerial approval.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-indigo-800/80 flex items-center justify-between">
            <span className="text-xs text-indigo-200">Need personal time or medical rest?</span>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* Balance Breakdown 1: Sick Leave */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sick / Medical</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">7</span>
            <span className="text-xs text-slate-400 ml-1">Allocated</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">No doctor note required for &le; 2 consecutive days</p>
        </div>

        {/* Balance Breakdown 2: Casual & Planned */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Casual / Planned</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">11</span>
            <span className="text-xs text-slate-400 ml-1">Allocated</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Flexible advance notice for travel and domestic needs</p>
        </div>
      </div>

      {/* If Manager: Pending Approvals Queue with 1-Click Buttons */}
      {isManager && (
        <div className="bg-white rounded-3xl border border-amber-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pending Approvals Queue ({pendingLeaves.length})
                </h3>
                <p className="text-xs text-slate-500">
                  1-Click Manager Decisioning with optional feedback directives
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Action Required
            </span>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No leave requests currently pending review. All caught up!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingLeaves.map((leave) => {
                const applicant = profileMap.get(leave.user_id);

                return (
                  <div
                    key={leave.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={applicant?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(applicant?.full_name || 'Staff')}&backgroundColor=4f46e5`}
                          alt={applicant?.full_name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{applicant?.full_name}</p>
                          <p className="text-[11px] text-slate-500">{applicant?.designation}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {leave.days} Day(s)
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600 font-medium">
                        <span>{leave.leave_type}</span>
                        <span className="font-mono text-slate-800">
                          {leave.start_date} &rarr; {leave.end_date}
                        </span>
                      </div>
                      <p className="text-slate-700 italic pt-1 border-t border-slate-100">
                        "{leave.reason}"
                      </p>
                    </div>

                    {/* 1-Click Fast Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => setReviewingLeave(leave)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Add Comment</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => reviewLeave(leave.id, 'Rejected')}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => reviewLeave(leave.id, 'Approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>1-Click Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Leave Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isManager ? 'Company-wide Leave History' : 'My Leave Applications'}
            </h3>
            <p className="text-xs text-slate-500">Live PostgreSQL tracker with managerial feedback trail</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              onClick={() => setShowApplyModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Leave Request</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Category</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Date Window</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Manager Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No leave requests found matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const applicant = profileMap.get(l.user_id);
                  const isApproved = l.status === 'Approved';
                  const isRejected = l.status === 'Rejected';
                  const isPending = l.status === 'Pending';

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={applicant?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(applicant?.full_name || 'Staff')}&backgroundColor=4f46e5`}
                            alt={applicant?.full_name}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{applicant?.full_name}</p>
                            <p className="text-[10px] text-slate-400">{applicant?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{l.leave_type}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {l.days} {l.days === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {l.start_date} &rarr; {l.end_date}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={l.reason}>
                        "{l.reason}"
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic text-[11px] max-w-xs truncate">
                        {l.manager_comment || (isPending ? 'Awaiting manager review' : 'No comments')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ApplyLeaveModal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} />
      <LeaveReviewModal leave={reviewingLeave} onClose={() => setReviewingLeave(null)} />
    </div>
  );
};
