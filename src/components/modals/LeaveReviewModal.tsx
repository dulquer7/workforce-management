import React, { useState } from 'react';
import { X, CheckCircle, XCircle, User, Calendar, MessageSquare } from 'lucide-react';
import { LeaveRequest } from '../../types';
import { useData } from '../../context/DataContext';

interface LeaveReviewModalProps {
  leave: LeaveRequest | null;
  onClose: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({ leave, onClose }) => {
  const { reviewLeave, profiles } = useData();
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!leave) return null;

  const applicant = profiles.find((p) => p.id === leave.user_id);

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    setProcessing(true);
    await reviewLeave(leave.id, status, comment.trim());
    setProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Review Leave Request</h3>
              <p className="text-xs text-slate-300">Managerial Action & Feedback</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Employee Info Header */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <img
              src={applicant?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
              alt={applicant?.full_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 truncate">{applicant?.full_name}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                  {leave.days} Day(s)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {applicant?.designation} &bull; {applicant?.department}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Category</span>
              <span className="font-semibold text-slate-800">{leave.leave_type}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Date Range</span>
              <span className="font-semibold text-slate-800">
                {leave.start_date} to {leave.end_date}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
            <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-1">
              Applicant Stated Reason
            </span>
            <p className="text-slate-800 leading-relaxed italic">"{leave.reason}"</p>
          </div>

          {/* Manager Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Manager Comment / Directives (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Approved. Ensure ticket handoff is complete..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-3 border-t border-slate-100">
            <button
              type="button"
              disabled={processing}
              onClick={() => handleAction('Rejected')}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Request</span>
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={() => handleAction('Approved')}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/25 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Leave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
