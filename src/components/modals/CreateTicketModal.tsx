import React, { useState } from 'react';
import { X, LifeBuoy, Send, ShieldAlert } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TicketCategory, TicketPriority } from '../../types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const { createTicket } = useData();

  const [category, setCategory] = useState<TicketCategory>('IT Support');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    const success = await createTicket({
      category,
      priority,
      subject: subject.trim(),
      description: description.trim(),
    });
    setSubmitting(false);

    if (success) {
      setSubject('');
      setDescription('');
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
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Raise Support Ticket</h3>
              <p className="text-xs text-slate-300">ITSM Help Desk Dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              >
                <option value="IT Support">IT Support (Hardware & Software)</option>
                <option value="Payroll">Payroll & Tax Queries</option>
                <option value="HR Policy">HR Policy & Benefits</option>
                <option value="Facilities">Facilities & Workplace</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              >
                <option value="Low">Low — General inquiry</option>
                <option value="Medium">Medium — Standard resolution</option>
                <option value="High">High — Blocker / Urgent</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ticket Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. AWS VPN certificate expired, reimbursement question..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Issue Description & Error Details
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, exact error messages, hardware serial numbers, or relevant dates..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
              required
            />
          </div>

          {/* Footer */}
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
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Raise Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
