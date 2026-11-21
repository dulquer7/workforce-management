import React, { useState } from 'react';
import { X, CheckCircle2, Clock, AlertCircle, ArrowRight, MessageSquare, User, Save } from 'lucide-react';
import { SupportTicket, TicketStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface TicketDetailsModalProps {
  ticket: SupportTicket | null;
  onClose: () => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, onClose }) => {
  const { updateTicket, profiles } = useData();
  const { isManager } = useAuth();

  const [status, setStatus] = useState<TicketStatus>(ticket?.status || 'Open');
  const [resolutionNotes, setResolutionNotes] = useState<string>(ticket?.resolution_notes || '');
  const [saving, setSaving] = useState(false);

  if (!ticket) return null;

  const author = profiles.find((p) => p.id === ticket.user_id);
  const assignee = profiles.find((p) => p.id === ticket.assigned_to);

  const handleSave = async () => {
    setSaving(true);
    await updateTicket(ticket.id, {
      status,
      resolution_notes: resolutionNotes.trim() || null,
    });
    setSaving(false);
    onClose();
  };

  // Timeline steps
  const steps: { label: string; key: TicketStatus; icon: any }[] = [
    { label: 'Open', key: 'Open', icon: Clock },
    { label: 'In Progress', key: 'In Progress', icon: AlertCircle },
    { label: 'Resolved', key: 'Resolved', icon: CheckCircle2 },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === ticket.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                {ticket.ticket_number}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  ticket.priority === 'High'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : ticket.priority === 'Medium'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {ticket.priority} Priority
              </span>
              <span className="text-xs text-slate-400">&bull; {ticket.category}</span>
            </div>
            <h3 className="text-base font-bold text-white">{ticket.subject}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Timeline */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">
              Transparent ITSM Lifecycle Timeline
            </span>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
              {steps.map((st, idx) => {
                const Icon = st.icon;
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={st.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 ${
                        isCurrent ? 'text-indigo-600 font-bold' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Description & Context
            </span>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {ticket.description}
            </p>
          </div>

          {/* Raised by & Created date */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Raised By</span>
              <p className="font-semibold text-slate-800">{author?.full_name || 'Employee'}</p>
              <p className="text-[11px] text-slate-500">{author?.department}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Support</span>
              <p className="font-semibold text-slate-800">{assignee?.full_name || 'Workforce IT Operations'}</p>
              <p className="text-[11px] text-slate-500">Tier 2 Support Specialist</p>
            </div>
          </div>

          {/* Manager / Admin Controls: Update Status & Resolution Notes */}
          {isManager ? (
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Manager Actions & Resolution
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                  Manager Mode
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Notes / Action Taken
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document resolution, root cause, or dispatched hardware..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                />
              </div>
            </div>
          ) : (
            ticket.resolution_notes && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-1">Resolution Summary</span>
                <p className="text-xs text-emerald-800 leading-relaxed">{ticket.resolution_notes}</p>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Close
          </button>
          {isManager && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Ticket Status'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
