import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  Shield,
  UserCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  UserPlus,
  Edit3,
  X,
  Save,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Profile, AttendanceStatus } from '../types';

export const EmployeeDirectory: React.FC = () => {
  const { currentUser, isManager } = useAuth();
  const { profiles, assignManager, updateEmployee } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [teamScopeFilter, setTeamScopeFilter] = useState<'all' | 'my_team'>('all');

  // Edit employee modal state
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);
  const [editStatus, setEditStatus] = useState<'Active' | 'On Leave' | 'Remote'>('Active');
  const [editLeaveBalance, setEditLeaveBalance] = useState<number>(18);
  const [editManagerId, setEditManagerId] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // List of managers for assignment dropdowns
  const availableManagers = profiles.filter((p) => p.role === 'manager');
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const openEditModal = (p: Profile) => {
    setEditingEmployee(p);
    setEditStatus(p.status);
    setEditLeaveBalance(p.leave_balance);
    setEditManagerId(p.manager_id || '');
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee) return;
    setSavingEdit(true);

    await updateEmployee(editingEmployee.id, {
      status: editStatus,
      leave_balance: editLeaveBalance,
      manager_id: editManagerId || null,
    });

    setSavingEdit(false);
    setEditingEmployee(null);
  };

  const handleQuickAssignToMe = async (employeeId: string) => {
    if (!currentUser) return;
    await assignManager(employeeId, currentUser.id);
  };

  const filteredProfiles = profiles.filter((p) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.full_name.toLowerCase().includes(q);
      const matchEmail = p.email.toLowerCase().includes(q);
      const matchDept = p.department.toLowerCase().includes(q);
      const matchDesig = p.designation.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDept && !matchDesig) return false;
    }

    // Team scope filter for HR/Manager (Requirement 3)
    if (isManager && teamScopeFilter === 'my_team') {
      if (p.manager_id !== currentUser?.id) return false;
    }

    // Department filter
    if (departmentFilter !== 'All' && p.department !== departmentFilter) return false;

    // Status filter
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;

    return true;
  });

  const myTeamCount = profiles.filter((p) => p.manager_id === currentUser?.id).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isManager ? 'Team & Assignments Console' : 'Enterprise Directory'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isManager ? 'HR Personnel & Reporting Structure' : 'Employee Directory'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            {isManager
              ? `Manage registered profiles, assign reporting managers, and update live presence status or leave quotas.`
              : `Explore your colleagues across Engineering, Product Design, Operations, and Finance.`}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <div className="px-3 py-1 text-center">
            <span className="text-base font-black text-slate-900">{profiles.length}</span>
            <span className="text-[10px] text-slate-500 font-bold block">Total Users</span>
          </div>
          {isManager && (
            <>
              <div className="w-px h-8 bg-slate-200" />
              <div className="px-3 py-1 text-center">
                <span className="text-base font-black text-indigo-600">{myTeamCount}</span>
                <span className="text-[10px] text-indigo-600 font-bold block">My Team</span>
              </div>
            </>
          )}
          <div className="w-px h-8 bg-slate-200" />
          <div className="px-3 py-1 text-center">
            <span className="text-base font-black text-emerald-600">
              {profiles.filter((p) => p.status === 'Active').length}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">Active</span>
          </div>
        </div>
      </div>

      {/* Scope, Filter, and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by full name, job title, email, or department..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Manager Team Scope Toggle (Requirement 3) */}
          {isManager && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setTeamScopeFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  teamScopeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Employees
              </button>
              <button
                onClick={() => setTeamScopeFilter('my_team')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  teamScopeFilter === 'my_team'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                My Assigned Team ({myTeamCount})
              </button>
            </div>
          )}

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Design">Product Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance & Payroll">Finance & Payroll</option>
            <option value="DevOps & Cloud">DevOps & Cloud</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Remote">Remote</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Directory Cards Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No profiles found</h4>
          <p className="text-xs text-slate-400">
            {teamScopeFilter === 'my_team'
              ? 'No employees are currently assigned to you. Click "All Employees" and assign team members using the "Assign to Me" button.'
              : 'Try clearing your search query or department filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map((p) => {
            const isManagerRole = p.role === 'manager';
            const managerObj = p.manager_id ? profileMap.get(p.manager_id) : null;
            const isAssignedToMe = isManager && p.manager_id === currentUser?.id;

            const statusStyles = {
              Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              'On Leave': 'bg-amber-50 text-amber-700 border-amber-200',
              Remote: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            }[p.status];

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Header: Avatar, Status, Role */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative">
                      <img
                        src={
                          p.avatar_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name)}&backgroundColor=4f46e5`
                        }
                        alt={p.full_name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                          p.status === 'Active'
                            ? 'bg-emerald-500'
                            : p.status === 'Remote'
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${statusStyles}`}>
                        {p.status}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isManagerRole
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}
                      >
                        {p.role}
                      </span>
                    </div>
                  </div>

                  {/* Name, Title, Dept */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {p.full_name}
                    </h3>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                      {p.designation}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.department}</span>
                    </p>
                  </div>

                  {/* Assigned Reporting Manager (Requirement 3) */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Reporting Manager
                      </span>
                      {isAssignedToMe && (
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                          Your Team
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      {managerObj ? (
                        <span className="font-semibold text-slate-800 truncate">
                          {managerObj.full_name}{' '}
                          <span className="text-slate-400 font-normal">({managerObj.designation})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{p.email}</span>
                    </div>
                    {p.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Manager Actions & Quick Assign */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Leave Balance: <strong className="text-slate-800 font-bold">{p.leave_balance}d</strong>
                  </span>

                  {isManager && (
                    <div className="flex items-center gap-1.5">
                      {!isAssignedToMe && p.id !== currentUser?.id && (
                        <button
                          onClick={() => handleQuickAssignToMe(p.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                          title="Assign this employee to report to you"
                        >
                          Assign to Me
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Edit employee status / manager assignment"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Employee / Manager Assignment Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Edit Profile & Team Assignment</h3>
                <p className="text-xs text-slate-300">{editingEmployee.full_name}</p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4 text-xs">
              {/* Assign Reporting Manager */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reporting Manager (manager_id)
                </label>
                <select
                  value={editManagerId}
                  onChange={(e) => setEditManagerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">None (Unassigned)</option>
                  {availableManagers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Live Presence Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Active">Active (Office)</option>
                  <option value="Remote">Remote</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {/* Leave Balance */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Leave Balance (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editLeaveBalance}
                  onChange={(e) => setEditLeaveBalance(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
