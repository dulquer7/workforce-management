export type UserRole = 'employee' | 'manager';

export interface Profile {
  id: string; // matches auth.users.id
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  designation: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: 'Active' | 'On Leave' | 'Remote';
  leave_balance: number;
  manager_id?: string | null;
  created_at: string;
  manager?: Profile;
}

export type AttendanceStatus = 'Present' | 'Half Day' | 'Overtime' | 'Absent' | 'Remote';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  clock_in: string | null; // ISO timestamp
  clock_out: string | null; // ISO timestamp
  work_duration_minutes: number;
  status: AttendanceStatus;
  location: string;
  notes?: string | null;
  created_at: string;
  profile?: Profile;
}

export type LeaveType =
  | 'Annual Leave'
  | 'Sick Leave'
  | 'Casual Leave'
  | 'Maternity / Paternity'
  | 'Unpaid Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: LeaveType;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: LeaveStatus;
  manager_comment?: string | null;
  applied_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  profile?: Profile;
  reviewer?: Profile;
}

export type TicketCategory = 'IT Support' | 'Payroll' | 'HR Policy' | 'Facilities';
export type TicketPriority = 'Low' | 'Medium' | 'High';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  status: TicketStatus;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  assignee?: Profile;
}

export interface ActivityItem {
  id: string;
  type: 'leave' | 'ticket' | 'attendance';
  title: string;
  description: string;
  timestamp: string;
  badgeText: string;
  badgeVariant: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  author: {
    name: string;
    avatar?: string | null;
    department: string;
  };
}
