import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabaseAuth } from '@/lib/supabaseClient';
import { runtimeStatus } from '@/lib/runtimeConfig';

const AuthContext = createContext();

const fallbackUser = {
  id: 'local-student',
  email: 'local@ai-in-action.local',
  name: 'AI in Action Student',
  mode: 'synthetic',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'ai-in-action-labs',
    public_settings: {
      app_name: 'AI in Action Labs',
      auth_mode: runtimeStatus.supabase === 'configured' ? 'supabase' : 'synthetic',
      base44: 'disabled',
    },
  });

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    setIsLoadingAuth(true);
    setIsLoadingPublicSettings(false);
    setAuthError(null);

    if (runtimeStatus.supabase !== 'configured') {
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setAuthChecked(true);
      setIsLoadingAuth(false);
      return;
    }

    try {
      const { data, error } = await supabaseAuth.getSession();
      if (error) throw error;
      const sessionUser = data?.session?.user;
      if (sessionUser) {
        setUser(sessionUser);
        setIsAuthenticated(true);
      } else {
        setUser(fallbackUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('Supabase auth check failed; using synthetic fallback:', error);
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = checkAppState;

  const logout = async () => {
    if (runtimeStatus.supabase === 'configured') {
      await supabaseAuth.signOut();
    }
    setUser(fallbackUser);
    setIsAuthenticated(true);
  };

  const navigateToLogin = () => {
    setUser(fallbackUser);
    setIsAuthenticated(true);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
    }}>
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
