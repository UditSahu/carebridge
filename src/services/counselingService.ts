import { supabase, CounselingSession, Therapist } from '@/lib/supabase';

export const counselingService = {
  // Get all therapists
  async getTherapists(): Promise<Therapist[]> {
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching therapists:', error);
      throw error;
    }

    return data || [];
  },

  // Get a specific therapist
  async getTherapist(therapistId: string): Promise<Therapist | null> {
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('id', therapistId)
      .single();

    if (error) {
      console.error('Error fetching therapist:', error);
      throw error;
    }

    return data;
  },

  // Get user's counseling sessions
  async getUserSessions(userId: string): Promise<CounselingSession[]> {
    const { data, error } = await supabase
      .from('counseling_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: false });

    if (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }

    return data || [];
  },

  // Book a counseling session
  async bookSession(
    session: Omit<CounselingSession, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CounselingSession> {
    const { data, error } = await supabase
      .from('counseling_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      console.error('Error booking session:', error);
      throw error;
    }

    return data;
  },

  // Update session status
  async updateSessionStatus(
    sessionId: string,
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<void> {
    const { error } = await supabase
      .from('counseling_sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },

  // Add session notes
  async addSessionNotes(sessionId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('counseling_sessions')
      .update({ notes })
      .eq('id', sessionId);

    if (error) {
      console.error('Error adding session notes:', error);
      throw error;
    }
  },

  // Cancel a session
  async cancelSession(sessionId: string): Promise<void> {
    await this.updateSessionStatus(sessionId, 'cancelled');
  }
};
