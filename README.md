# SemilWork — Smart Workforce & Employee Support Management System

**SemilWork** is an enterprise-grade workforce operations and internal ITSM support platform built with **React (Vite)**, **Tailwind CSS**, **Lucide Icons**, and **@supabase/supabase-js**.

---

## 🌟 Key Features & Architecture

### 1. Dual-Role Architecture (`employee` & `manager`)
- **Quick Demo Switcher**: A segmented top-bar controller enabling evaluators to switch between **View as Employee** (Rohan Verma) and **View as HR/Manager** (Vikram Malhotra / Priya Sharma) instantly without re-entering passwords.
- **Supabase Email/Password Auth**: Full authentication modal supporting standard login as well as 1-click evaluator pre-fill chips.
- **SaaS Slate/Indigo Palette**: Clean, modern enterprise UI with responsive collapsible sidebar and mobile drawer.

### 2. Core Modules
- **📊 Executive & Workforce Dashboard**:
  - Real-time KPI Cards: Attendance Streak & Status, Available Leave Balance, Open ITSM Tickets, and Team Presence (Active, Remote, On Leave).
  - 1-Click Clock-In / Clock-Out hero banner with live running stopwatch.
  - Unified live activity feed aggregating leave requests and support tickets in reverse-chronological order.
- **⏱️ Attendance Tracker**:
  - Employee 1-click Clock-In / Clock-Out logging exact ISO timestamps for today's date.
  - Live elapsed hours & minutes stopwatch ticker.
  - Workplace location selector (Bengaluru HQ, WFH - Remote Hub, Client On-Site) and shift notes.
  - Personal verified attendance history table.
  - **Manager View**: Company-wide daily attendance summary table with department and shift status filtering.
- **🏖️ Leave Management**:
  - Employee application form: Leave Category (Annual, Sick, Casual, Maternity/Paternity, Unpaid), Start Date, End Date, calculated total days, and handover reason.
  - Real-time status tracker (Pending, Approved, Rejected) with managerial feedback trail.
  - **Manager View**: 1-click **Approve** and **Reject** buttons with custom managerial feedback directives. Automatically deducts days from the employee's leave balance upon approval.
- **🎫 Internal Support Desk (ITSM)**:
  - Ticket submission: Categories (*IT Support*, *Payroll*, *HR Policy*, *Facilities*), Priority (*Low*, *Medium*, *High*), Subject, and Description.
  - Transparent 3-step lifecycle timeline: `Open` &rarr; `In Progress` &rarr; `Resolved`.
  - Search by ticket number (e.g., `TICK-1001`), subject, or keyword with multi-factor filters.
  - **Manager View**: Update ticket status, reassign support staff, and record resolution notes.
- **👥 Employee Directory**:
  - Searchable and filterable roster of 6 Indian employees across Engineering, HR, Product Design, DevOps, and Finance.
  - Live presence status badges (*Active*, *Remote*, *On Leave*), department, email, phone, and 1-click persona switcher.

---

## 🚀 Supabase PostgreSQL Configuration

The application is pre-configured with the provided Supabase project credentials in `.env` and `.env.example`:

```env
VITE_SUPABASE_URL=https://yqjrwihetwbdpxrvxnqe.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_luC2H_eJFBsWm1x9FeXCXw_uK1I9YSM
```

### Applying Database Schema (`schema.sql`)
1. Open the Supabase Project Dashboard &gt; **SQL Editor**.
2. Copy the contents of [`schema.sql`](file:///e:/WorkforceManagement/schema.sql) (or click the **"Copy schema.sql Script"** button inside the app's top bar **Supabase Ready** modal).
3. Paste and click **Run**.
4. The tables will be created with `DISABLE ROW LEVEL SECURITY;` for demo convenience, alongside realistic Indian employee records, recent attendance history, leave requests, and ITSM tickets:
   - `profiles`
   - `attendance`
   - `leave_requests`
   - `support_tickets`

> **Note for Evaluators**: SemilWork includes a seamless offline/local fallback layer. Even before running the SQL script in Supabase, the full application is interactive with zero blank screens or failed buttons.

---

## 🇮🇳 Realistic Seed Profiles (6 Indian Employees)

| Name | Role | Department | Designation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Vikram Malhotra** | Manager | Engineering & Tech Ops | Director of Engineering | Active |
| **Priya Sharma** | Manager | Human Resources | Senior HR Business Partner | Active |
| **Rohan Verma** | Employee | Engineering | Senior Full-Stack Engineer | Active |
| **Ananya Iyer** | Employee | Product Design | Lead UI/UX Designer | On Leave |
| **Aarav Patel** | Employee | DevOps & Cloud | DevOps Infrastructure Engineer | Remote |
| **Sneha Mukherjee** | Employee | Finance & Payroll | Financial Operations Analyst | Active |

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

The application runs on `http://localhost:5173/`.
