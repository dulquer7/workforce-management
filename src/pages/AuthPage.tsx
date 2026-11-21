import React, { useState } from 'react';
import {
  Briefcase,
  Mail,
  Lock,
  User,
  Building,
  BadgeCheck,
  Phone,
  ArrowRight,
  Shield,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, loadingAuth } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!signInEmail.trim() || !signInPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const res = await signIn(signInEmail, signInPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials or user not found.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!fullName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const res = await signUp({
      full_name: fullName,
      email: signUpEmail,
      password: signUpPassword,
      role,
      department,
      designation: designation.trim() || (role === 'manager' ? 'Department Manager' : 'Specialist'),
      phone: phone.trim() || undefined,
    });

    if (res.success) {
      if (res.requiresEmailConfirmation) {
        setInfoMessage('Account registered! If email confirmation is enabled on your Supabase project, check your inbox to confirm before signing in.');
        setMode('signin');
        setSignInEmail(signUpEmail);
      }
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          SemilWork
        </h1>
        <p className="mt-1.5 text-xs text-slate-400 font-medium">
          Smart Workforce & Employee Support Management System
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 p-1 bg-slate-900 border border-slate-800 rounded-2xl flex max-w-xs mx-auto shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium leading-relaxed">
              {infoMessage}
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAuth}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loadingAuth ? 'Signing in...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  New to SemilWork?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage('');
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Register new account
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                      role === 'employee'
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-semibold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 mt-0.5 ${role === 'employee' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold">Employee</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Clock-in, apply leaves, raise tickets</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('manager')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                      role === 'manager'
                        ? 'border-purple-500 bg-purple-50/70 text-purple-950 font-semibold ring-2 ring-purple-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className={`w-4 h-4 mt-0.5 ${role === 'manager' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold">HR / Manager</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Manage team, approve leaves, ITSM</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="rahul@company.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Department & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Payroll">Finance & Payroll</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAuth}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loadingAuth ? 'Creating Account & Profile...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage('');
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Sign In
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
