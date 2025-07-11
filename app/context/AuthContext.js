import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '../supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  }, []);

  useEffect(() => {
    // onAuthStateChange is called every time the session changes,
    // including on startup. This is the single source of truth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);

      // Enforce ban by checking the user object from the session
      if (session?.user?.banned_until && new Date(session.user.banned_until) > new Date()) {
        Alert.alert('Account Suspended', 'Your account has been suspended.');
        await supabase.auth.signOut();
        return;
      }

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const value = {
    session,
    profile,
    loading,
    isPremium: profile?.role === 'premium' || profile?.role === 'admin',
    isAdmin: profile?.role === 'admin',
    refreshProfile: () => (session?.user ? fetchProfile(session.user.id) : Promise.resolve()),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);