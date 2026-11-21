import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Laptop,
  CreditCard,
  BookOpen,
  Building,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CreateTicketModal } from '../components/modals/CreateTicketModal';
import { TicketDetailsModal } from '../components/modals/TicketDetailsModal';
import { SupportTicket, TicketCategory, TicketPriority, TicketStatus } from '../types';

export const SupportDesk: React.FC = () => {
  const { currentUser, isManager } = useAuth();
  if (!currentUser) return null;
  const { tickets, profiles } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Filtering
  const filteredTickets = tickets.filter((t) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchNum = t.ticket_number.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      if (!matchSub && !matchNum && !matchDesc) return false;
    }

    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;
    if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;

    return true;
  });

  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case 'IT Support':
        return <Laptop className="w-4 h-4 text-blue-500" />;
      case 'Payroll':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'HR Policy':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'Facilities':
        return <Building className="w-4 h-4 text-amber-500" />;
      default:
        return <LifeBuoy className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ITSM & Operations Service Desk
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Internal Employee Support
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            SLA-monitored incident resolution covering IT infrastructure, salary and TDS queries, corporate HR handbooks, and physical office ergonomics.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Support Ticket</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by number (e.g. TICK-1001), keywords, or hardware..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Categories</option>
            <option value="IT Support">IT Support</option>
            <option value="Payroll">Payroll</option>
            <option value="HR Policy">HR Policy</option>
            <option value="Facilities">Facilities</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No support tickets found</h4>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or raise a new ticket using the button above.
            </p>
          </div>
        ) : (
          filteredTickets.map((t) => {
            const author = profileMap.get(t.user_id);
            const assignee = profileMap.get(t.assigned_to || '');

            const statusPills = {
              Open: 'bg-amber-50 text-amber-700 border-amber-200',
              'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
              Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            }[t.status];

            const priorityPills = {
              High: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
              Medium: 'bg-amber-50 text-amber-700 border-amber-200',
              Low: 'bg-slate-100 text-slate-700 border-slate-200',
            }[t.priority];

            return (
              <div
                key={t.id}
                onClick={() => setActiveTicket(t)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Number, Category, Subject */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 text-white">
                        {t.ticket_number}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {getCategoryIcon(t.category)}
                        <span>{t.category}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${priorityPills}`}
                      >
                        {t.priority} Priority
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                      {t.subject}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Right: Author, Timeline Pill, Manager Resolution note */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Author & Assignee */}
                    <div className="text-left sm:text-right">
                      <div className="flex items-center sm:justify-end gap-2">
                        <span className="text-xs font-semibold text-slate-800">
                          {author?.full_name}
                        </span>
                        <img
                          src={author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author?.full_name || 'User')}&backgroundColor=4f46e5`}
                          alt={author?.full_name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {new Date(t.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusPills}`}
                      >
                        {t.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </div>

                {/* Resolution snippet preview if resolved */}
                {t.resolution_notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Resolution Note: </span>
                      <span>{t.resolution_notes}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <CreateTicketModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <TicketDetailsModal ticket={activeTicket} onClose={() => setActiveTicket(null)} />
    </div>
  );
};
