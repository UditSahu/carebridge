import { supabase, User } from '@/lib/supabase';

export const authService = {
  // Sign up with email
  async signUp(email: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }

    // Create user record in our users table
    if (data.user) {
      await this.createUserRecord(data.user.id, email);
    }

    return data;
  },

  // Sign in with email
  async signIn(email: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    return data;
  },

  // Sign out
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<any> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      throw error;
    }

    return user;
  },

  // Get current session
  async getSession(): Promise<any> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }

    return session;
  },

  // Create anonymous user
  async createAnonymousUser(): Promise<User> {
    const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        anonymous_id: anonymousId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating anonymous user:', error);
      throw error;
    }

    // Store anonymous ID in localStorage for persistence
    localStorage.setItem('mindscape_anonymous_id', anonymousId);

    return data;
  },

  // Get or create anonymous user
  async getOrCreateAnonymousUser(): Promise<User> {
    const storedAnonymousId = localStorage.getItem('mindscape_anonymous_id');

    if (storedAnonymousId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('anonymous_id', storedAnonymousId)
        .single();

      if (!error && data) {
        return data;
      }
    }

    return this.createAnonymousUser();
  },

  // Create user record in users table
  async createUserRecord(userId: string, email: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user record:', error);
      throw error;
    }

    return data;
  },

  // Update user email
  async updateEmail(newEmail: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
