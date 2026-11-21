import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Send, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { LeaveType } from '../../types';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose }) => {
  const { applyLeave, userLeaveBalance } = useData();

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual Leave');
  const [startDate, setStartDate] = useState<string>(tomorrow);
  const [endDate, setEndDate] = useState<string>(tomorrow);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const calculatedDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    const success = await applyLeave({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      days: calculatedDays,
      reason: reason.trim(),
    });
    setSubmitting(false);

    if (success) {
      setReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Apply for Leave</h3>
              <p className="text-xs text-slate-300">Submit request for manager review</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Balance Pill */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-900">Current Available Balance</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
              {userLeaveBalance} Days
            </span>
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              <option value="Annual Leave">Annual Leave (Planned Vacation)</option>
              <option value="Sick Leave">Sick Leave (Medical Recovery)</option>
              <option value="Casual Leave">Casual Leave (Personal / Urgent)</option>
              <option value="Maternity / Paternity">Maternity / Paternity Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (new Date(e.target.value) > new Date(endDate)) {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500">
              Total requested:{' '}
              <strong className="text-slate-800 font-bold">{calculatedDays} day(s)</strong>
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Handover Details
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context for your manager (e.g., family commitment, project handoff to teammate)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition"
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Leave Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
