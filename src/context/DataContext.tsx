import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Profile,
  AttendanceRecord,
  LeaveRequest,
  SupportTicket,
  ActivityItem,
  LeaveType,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

interface DataContextValue {
  profiles: Profile[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  tickets: SupportTicket[];
  activities: ActivityItem[];
  loading: boolean;
  refreshData: () => Promise<void>;

  // Attendance operations
  todayAttendance: AttendanceRecord | undefined;
  isClockedIn: boolean;
  clockInTime: Date | null;
  elapsedSeconds: number;
  clockIn: (location?: string, notes?: string) => Promise<boolean>;
  clockOut: () => Promise<boolean>;

  // Leave operations
  applyLeave: (data: {
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    days: number;
    reason: string;
  }) => Promise<boolean>;
  reviewLeave: (leaveId: string, status: 'Approved' | 'Rejected', comment?: string) => Promise<boolean>;

  // Ticket operations
  createTicket: (data: {
    category: TicketCategory;
    priority: TicketPriority;
    subject: string;
    description: string;
  }) => Promise<boolean>;
  updateTicket: (ticketId: string, updates: Partial<SupportTicket>) => Promise<boolean>;

  // HR & Manager Team Operations (manager_id)
  assignManager: (employeeId: string, managerId: string | null) => Promise<boolean>;
  updateEmployee: (employeeId: string, updates: Partial<Profile>) => Promise<boolean>;

  // Stats
  userLeaveBalance: number;
  openTicketsCount: number;
  reportingManager: Profile | null;
  teamPresenceCount: { present: number; total: number; remote: number; onLeave: number };
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isManager, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch real data from Supabase
  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch all profiles
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (profData) {
        setProfiles(profData as Profile[]);
      } else if (profErr) {
        console.warn('Profiles fetch error:', profErr.message);
      }

      // 2. Fetch attendance
      const { data: attData, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (attData) {
        setAttendance(attData as AttendanceRecord[]);
      } else if (attErr) {
        console.warn('Attendance fetch error:', attErr.message);
      }

      // 3. Fetch leaves
      const { data: lData, error: lErr } = await supabase
        .from('leave_requests')
        .select('*')
        .order('applied_at', { ascending: false });

      if (lData) {
        setLeaves(lData as LeaveRequest[]);
      } else if (lErr) {
        console.warn('Leaves fetch error:', lErr.message);
      }

      // 4. Fetch support tickets
      const { data: tData, error: tErr } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (tData) {
        setTickets(tData as SupportTicket[]);
      } else if (tErr) {
        console.warn('Tickets fetch error:', tErr.message);
      }
    } catch (err) {
      console.error('Data sync error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    } else {
      setProfiles([]);
      setAttendance([]);
      setLeaves([]);
      setTickets([]);
      setLoading(false);
    }
  }, [currentUser, fetchData]);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's attendance for current active user
  const todayAttendance = useMemo(() => {
    if (!currentUser) return undefined;
    return attendance.find((a) => a.user_id === currentUser.id && a.date === todayStr);
  }, [attendance, currentUser, todayStr]);

  const isClockedIn = Boolean(todayAttendance?.clock_in && !todayAttendance?.clock_out);
  const clockInTime = todayAttendance?.clock_in ? new Date(todayAttendance.clock_in) : null;

  // Running elapsed timer when clocked in
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!isClockedIn || !clockInTime) {
      if (todayAttendance?.work_duration_minutes) {
        setElapsedSeconds(todayAttendance.work_duration_minutes * 60);
      } else {
        setElapsedSeconds(0);
      }
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diffSec = Math.max(0, Math.floor((now.getTime() - clockInTime.getTime()) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime, todayAttendance]);

  // 1-Click Clock In
  const clockIn = async (location = 'Bengaluru HQ', notes = 'Shift started'): Promise<boolean> => {
    if (!currentUser) return false;

    if (todayAttendance && todayAttendance.clock_out) {
      showToast('Shift Finished', "You have already clocked out for today's shift.", 'warning');
      return false;
    }

    if (isClockedIn) {
      showToast('Already Clocked In', "You are already active on today's shift.", 'info');
      return false;
    }

    const nowIso = new Date().toISOString();
    const newStatus = location.includes('Remote') || location.includes('WFH') ? 'Remote' : 'Present';

    try {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(
          {
            user_id: currentUser.id,
            date: todayStr,
            clock_in: nowIso,
            clock_out: null,
            work_duration_minutes: 0,
            status: newStatus,
            location,
            notes,
          },
          { onConflict: 'user_id,date' }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setAttendance((prev) => [data as AttendanceRecord, ...prev.filter((a) => !(a.user_id === currentUser.id && a.date === todayStr))]);
      } else {
        fetchData();
      }

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });

      showToast('Clock-in Successful!', `Logged at ${new Date(nowIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${location})`, 'success');
      return true;
    } catch (err: any) {
      showToast('Clock-in Failed', err.message || 'Please check your connection', 'error');
      return false;
    }
  };

  // 1-Click Clock Out
  const clockOut = async (): Promise<boolean> => {
    if (!currentUser || !todayAttendance || !todayAttendance.clock_in) {
      showToast('No Active Clock-in', "Please clock in first before clocking out.", 'warning');
      return false;
    }

    const nowIso = new Date().toISOString();
    const startTime = new Date(todayAttendance.clock_in);
    const durationMinutes = Math.max(1, Math.round((new Date(nowIso).getTime() - startTime.getTime()) / 60000));
    const hours = (durationMinutes / 60).toFixed(1);
    const newStatus = durationMinutes > 540 ? 'Overtime' : durationMinutes < 240 ? 'Half Day' : todayAttendance.status;

    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          clock_out: nowIso,
          work_duration_minutes: durationMinutes,
          status: newStatus,
        })
        .eq('id', todayAttendance.id);

      if (error) throw error;

      setAttendance((prev) =>
        prev.map((a) =>
          a.id === todayAttendance.id
            ? { ...a, clock_out: nowIso, work_duration_minutes: durationMinutes, status: newStatus }
            : a
        )
      );

      showToast('Clock-out Recorded', `Shift ended. Total duration: ${hours} hrs logged today. Have a restful evening!`, 'success');
      return true;
    } catch (err: any) {
      showToast('Clock-out Error', err.message || 'Failed to update attendance', 'error');
      return false;
    }
  };

  // Apply Leave
  const applyLeave = async (data: {
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    days: number;
    reason: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const { data: inserted, error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: currentUser.id,
          leave_type: data.leave_type,
          start_date: data.start_date,
          end_date: data.end_date,
          days: data.days,
          reason: data.reason,
          status: 'Pending',
        })
        .select()
        .single();

      if (error) throw error;

      if (inserted) {
        setLeaves((prev) => [inserted as LeaveRequest, ...prev]);
      } else {
        fetchData();
      }

      showToast('Leave Request Submitted', `${data.days} day(s) of ${data.leave_type} sent for managerial approval.`, 'success');
      return true;
    } catch (err: any) {
      showToast('Application Error', err.message || 'Could not submit leave request', 'error');
      return false;
    }
  };

  // Review Leave (Manager action)
  const reviewLeave = async (leaveId: string, status: 'Approved' | 'Rejected', comment?: string): Promise<boolean> => {
    if (!currentUser) return false;
    const target = leaves.find((l) => l.id === leaveId);
    if (!target) return false;

    const nowIso = new Date().toISOString();
    const managerComment = comment || (status === 'Approved' ? 'Approved by manager.' : 'Request rejected.');

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status,
          manager_comment: managerComment,
          reviewed_at: nowIso,
          reviewed_by: currentUser.id,
        })
        .eq('id', leaveId);

      if (error) throw error;

      setLeaves((prev) =>
        prev.map((l) =>
          l.id === leaveId
            ? {
                ...l,
                status,
                manager_comment: managerComment,
                reviewed_at: nowIso,
                reviewed_by: currentUser.id,
              }
            : l
        )
      );

      // If approved, deduct leave balance for that employee
      if (status === 'Approved') {
        const emp = profiles.find((p) => p.id === target.user_id);
        if (emp) {
          const newBalance = Math.max(0, emp.leave_balance - target.days);
          await supabase.from('profiles').update({ leave_balance: newBalance }).eq('id', emp.id);

          setProfiles((prev) =>
            prev.map((p) => (p.id === emp.id ? { ...p, leave_balance: newBalance } : p))
          );
        }

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      showToast(
        status === 'Approved' ? 'Leave Approved' : 'Leave Rejected',
        `Leave request marked as ${status}.`,
        status === 'Approved' ? 'success' : 'info'
      );
      return true;
    } catch (err: any) {
      showToast('Review Failed', err.message || 'Could not update leave request', 'error');
      return false;
    }
  };

  // Create Support Desk Ticket
  const createTicket = async (data: {
    category: TicketCategory;
    priority: TicketPriority;
    subject: string;
    description: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    const nextNum = 1000 + tickets.length + 1;
    const ticket_number = `TICK-${nextNum}`;

    try {
      const { data: inserted, error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number,
          user_id: currentUser.id,
          category: data.category,
          priority: data.priority,
          subject: data.subject,
          description: data.description,
          status: 'Open',
        })
        .select()
        .single();

      if (error) throw error;

      if (inserted) {
        setTickets((prev) => [inserted as SupportTicket, ...prev]);
      } else {
        fetchData();
      }

      showToast('Support Ticket Raised', `${ticket_number}: "${data.subject}" submitted to the support queue.`, 'success');
      return true;
    } catch (err: any) {
      showToast('Ticket Error', err.message || 'Could not raise ticket', 'error');
      return false;
    }
  };

  // Update Support Ticket
  const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>): Promise<boolean> => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return false;

    const nowIso = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          ...updates,
          updated_at: nowIso,
        })
        .eq('id', ticketId);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, ...updates, updated_at: nowIso } : t))
      );

      if (updates.status === 'Resolved') {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
        });
      }

      showToast('Ticket Updated', `Ticket ${target.ticket_number} updated successfully.`, 'success');
      return true;
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Failed to update ticket', 'error');
      return false;
    }
  };

  // Assign Manager to an Employee (manager_id)
  const assignManager = async (employeeId: string, managerId: string | null): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ manager_id: managerId })
        .eq('id', employeeId);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((p) => (p.id === employeeId ? { ...p, manager_id: managerId } : p))
      );

      const managerProfile = managerId ? profiles.find((p) => p.id === managerId) : null;
      const empProfile = profiles.find((p) => p.id === employeeId);

      showToast(
        'Manager Assigned',
        managerProfile
          ? `${empProfile?.full_name} is now reporting to ${managerProfile.full_name}.`
          : `${empProfile?.full_name} is now unassigned.`,
        'success'
      );

      if (currentUser?.id === employeeId) {
        refreshProfile();
      }
      return true;
    } catch (err: any) {
      showToast('Assignment Error', err.message || 'Could not assign manager', 'error');
      return false;
    }
  };

  // Update Employee Status / Leave Balance
  const updateEmployee = async (employeeId: string, updates: Partial<Profile>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', employeeId);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((p) => (p.id === employeeId ? { ...p, ...updates } : p))
      );

      showToast('Employee Updated', 'Changes saved to profile.', 'success');
      return true;
    } catch (err: any) {
      showToast('Update Error', err.message || 'Could not update employee', 'error');
      return false;
    }
  };

  // Reporting Manager of Current User
  const reportingManager = useMemo<Profile | null>(() => {
    if (!currentUser || !currentUser.manager_id) return null;
    return profiles.find((p) => p.id === currentUser.manager_id) || null;
  }, [currentUser, profiles]);

  // Unified Live Activity Feed aggregating leaves and tickets
  const activities = useMemo<ActivityItem[]>(() => {
    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const items: ActivityItem[] = [];

    leaves.forEach((l) => {
      const user = profileMap.get(l.user_id);
      items.push({
        id: 'act-leave-' + l.id,
        type: 'leave',
        title: `${user?.full_name || 'Staff Member'} applied for ${l.leave_type} (${l.days} days)`,
        description: l.manager_comment
          ? `Manager directive: "${l.manager_comment}"`
          : `Reason: "${l.reason}"`,
        timestamp: l.reviewed_at || l.applied_at,
        badgeText: l.status.toUpperCase(),
        badgeVariant: l.status === 'Approved' ? 'emerald' : l.status === 'Rejected' ? 'rose' : 'amber',
        author: {
          name: user?.full_name || 'Staff Member',
          avatar: user?.avatar_url,
          department: user?.department || 'Operations',
        },
      });
    });

    tickets.forEach((t) => {
      const user = profileMap.get(t.user_id);
      items.push({
        id: 'act-tick-' + t.id,
        type: 'ticket',
        title: `${t.ticket_number}: ${t.subject}`,
        description: t.resolution_notes
          ? `Resolution: ${t.resolution_notes}`
          : `Category: ${t.category} • Priority: ${t.priority}`,
        timestamp: t.updated_at || t.created_at,
        badgeText: t.status.toUpperCase(),
        badgeVariant: t.status === 'Resolved' ? 'emerald' : t.status === 'In Progress' ? 'indigo' : 'amber',
        author: {
          name: user?.full_name || 'Employee',
          avatar: user?.avatar_url,
          department: user?.department || 'General',
        },
      });
    });

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [leaves, tickets, profiles]);

  // Current user's leave balance
  const userLeaveBalance = currentUser ? currentUser.leave_balance : 18;

  // Open tickets count
  const openTicketsCount = useMemo(() => {
    return tickets.filter((t) => t.status !== 'Resolved').length;
  }, [tickets]);

  // Team presence statistics
  const teamPresenceCount = useMemo(() => {
    const total = profiles.length;
    const todayLogs = attendance.filter((a) => a.date === todayStr);
    const present = todayLogs.filter((a) => a.status === 'Present' || a.status === 'Overtime').length;
    const remote = todayLogs.filter((a) => a.status === 'Remote').length;
    const onLeave = profiles.filter((p) => p.status === 'On Leave').length;
    return { present, total, remote, onLeave };
  }, [profiles, attendance, todayStr]);

  return (
    <DataContext.Provider
      value={{
        profiles,
        attendance,
        leaves,
        tickets,
        activities,
        loading,
        refreshData: fetchData,
        todayAttendance,
        isClockedIn,
        clockInTime,
        elapsedSeconds,
        clockIn,
        clockOut,
        applyLeave,
        reviewLeave,
        createTicket,
        updateTicket,
        assignManager,
        updateEmployee,
        userLeaveBalance,
        openTicketsCount,
        reportingManager,
        teamPresenceCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
