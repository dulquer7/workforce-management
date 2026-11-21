-- =========================================================================
-- SemilWork — Smart Workforce & Employee Support Management System
-- Clean Production Database Schema
-- =========================================================================

-- Enable uuid extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if resetting
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES TABLE (Linked 1:1 with auth.users via id)
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- matches auth.users.id
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('employee', 'manager')),
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Remote')),
    leave_balance INTEGER DEFAULT 18,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ATTENDANCE TABLE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    work_duration_minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Present' CHECK (status IN ('Present', 'Half Day', 'Overtime', 'Absent', 'Remote')),
    location TEXT DEFAULT 'Bengaluru HQ',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_daily_attendance UNIQUE (user_id, date)
);

-- 3. LEAVE REQUESTS TABLE
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity / Paternity', 'Unpaid Leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    manager_comment TEXT,
    applied_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 4. SUPPORT TICKETS TABLE (ITSM)
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('IT Support', 'Payroll', 'HR Policy', 'Facilities')),
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- DISABLE ROW LEVEL SECURITY for smooth hackathon demoing & evaluator convenience
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;

-- GRANT table permissions to Supabase anon and authenticated roles
GRANT ALL ON TABLE profiles, attendance, leave_requests, support_tickets TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
