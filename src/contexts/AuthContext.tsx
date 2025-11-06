import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { User } from '@/lib/supabase';

interface AuthContextType {
  user: any | null;
  userRecord: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  getOrCreateAnonymousUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any | null>(null);
  const [userRecord, setUserRecord] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch or create user record
          try {
            const { data } = await authService.getCurrentUser();
            if (data) {
              setUserRecord(data);
            }
          } catch (error) {
            console.error('Error fetching user record:', error);
          }
        } else {
          setUserRecord(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const currentUser = await authService.getCurrentUser();
        setUserRecord(currentUser);
      } else {
        // For anonymous users
        const anonymousUser = await authService.getOrCreateAnonymousUser();
        setUserRecord(anonymousUser);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    return authService.signUp(email, password);
  };

  const signIn = async (email: string, password: string) => {
    return authService.signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
    // Create new anonymous user after sign out
    const anonymousUser = await authService.getOrCreateAnonymousUser();
    setUserRecord(anonymousUser);
  };

  const getOrCreateAnonymousUser = async () => {
    const anonymousUser = await authService.getOrCreateAnonymousUser();
    setUserRecord(anonymousUser);
    return anonymousUser;
  };

  const value = {
    user,
    userRecord,
    loading,
    signUp,
    signIn,
    signOut,
    getOrCreateAnonymousUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
