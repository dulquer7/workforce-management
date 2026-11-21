import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';

interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  department: string;
  designation: string;
  phone?: string;
}

interface AuthContextValue {
  session: Session | null;
  currentUser: Profile | null;
  currentRole: UserRole | null;
  isManager: boolean;
  loadingAuth: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const { showToast } = useToast();

  // Helper to fetch profile by user id
  const fetchProfileForUser = async (user: User): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        return data as Profile;
      }

      // If profile not found by id, try matching by email
      if (user.email) {
        const { data: emailData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (emailData) {
          // Update id to match auth user id
          await supabase.from('profiles').update({ id: user.id }).eq('email', user.email);
          return { ...emailData, id: user.id } as Profile;
        }
      }

      // If user metadata exists but no profile row yet, auto-create profile
      const meta = user.user_metadata || {};
      const newProf: Profile = {
        id: user.id,
        email: user.email || '',
        full_name: meta.full_name || user.email?.split('@')[0] || 'User',
        role: meta.role === 'manager' ? 'manager' : 'employee',
        department: meta.department || 'Engineering',
        designation: meta.designation || (meta.role === 'manager' ? 'Department Manager' : 'Team Member'),
        phone: meta.phone || null,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(meta.full_name || user.email || 'User')}&backgroundColor=4f46e5`,
        status: 'Active',
        leave_balance: 18,
        manager_id: null,
        created_at: new Date().toISOString(),
      };

      const { data: inserted, error: insErr } = await supabase
        .from('profiles')
        .insert(newProf)
        .select()
        .single();

      if (!insErr && inserted) {
        return inserted as Profile;
      }

      return newProf;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  // Listen to Supabase Auth state changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      setLoadingAuth(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            const prof = await fetchProfileForUser(initialSession.user);
            if (mounted) setCurrentUser(prof);
          } else {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      if (newSession?.user) {
        const prof = await fetchProfileForUser(newSession.user);
        if (mounted) setCurrentUser(prof);
      } else {
        if (mounted) setCurrentUser(null);
      }
      if (mounted) setLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!session?.user) return;
    const prof = await fetchProfileForUser(session.user);
    if (prof) setCurrentUser(prof);
  };

  // Sign In
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoadingAuth(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoadingAuth(false);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const prof = await fetchProfileForUser(data.user);
        setCurrentUser(prof);
        setSession(data.session);
        setLoadingAuth(false);
        showToast('Signed In', `Welcome back, ${prof?.full_name || email}!`, 'success');
        return { success: true };
      }

      setLoadingAuth(false);
      return { success: false, error: 'User not found.' };
    } catch (err: any) {
      setLoadingAuth(false);
      return { success: false, error: err.message || 'Failed to sign in' };
    }
  };

  // Sign Up
  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
    setLoadingAuth(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.full_name.trim(),
            role: data.role,
            department: data.department,
            designation: data.designation.trim(),
            phone: data.phone?.trim() || '',
          },
        },
      });

      if (authErr) {
        setLoadingAuth(false);
        return { success: false, error: authErr.message };
      }

      if (!authData.user) {
        setLoadingAuth(false);
        return { success: false, error: 'Could not create account.' };
      }

      const userId = authData.user.id;
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.full_name)}&backgroundColor=4f46e5`;

      const newProfile: Profile = {
        id: userId,
        email: data.email.trim(),
        full_name: data.full_name.trim(),
        role: data.role,
        department: data.department,
        designation: data.designation.trim(),
        phone: data.phone?.trim() || null,
        avatar_url: avatarUrl,
        status: 'Active',
        leave_balance: 18,
        manager_id: null,
        created_at: new Date().toISOString(),
      };

      // Insert profile directly into profiles table
      const { error: profErr } = await supabase.from('profiles').upsert(newProfile);

      if (profErr) {
        console.warn('Profile table insert warning:', profErr);
      }

      // Check if session was returned directly (no email confirmation needed)
      if (authData.session) {
        setSession(authData.session);
        setCurrentUser(newProfile);
        setLoadingAuth(false);
        showToast('Account Created!', `Welcome to SemilWork, ${data.full_name}!`, 'success');
        return { success: true };
      }

      // If email confirmation is required by Supabase project settings
      setLoadingAuth(false);
      return { success: true, requiresEmailConfirmation: true };
    } catch (err: any) {
      setLoadingAuth(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoadingAuth(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setSession(null);
      setCurrentUser(null);
      setLoadingAuth(false);
      showToast('Logged Out', 'You have been safely signed out.', 'info');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        currentUser,
        currentRole: currentUser?.role || null,
        isManager: currentUser?.role === 'manager',
        loadingAuth,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
