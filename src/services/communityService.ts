import { supabase, CommunityMessage, Channel } from '@/lib/supabase';

export const communityService = {
  // Get all channels
  async getChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }

    return data || [];
  },

  // Get messages for a channel
  async getChannelMessages(channelId: string): Promise<CommunityMessage[]> {
    if (!channelId) return [];

    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      const code = (error.code || '').toString();
      if (code === 'PGRST116') return [];
      if (msg.includes('invalid input syntax for type uuid')) return [];
      return [];
    }

    return data || [];
  },

  // Post a message to a channel
  async postMessage(message: Omit<CommunityMessage, 'id' | 'created_at' | 'flagged'>): Promise<CommunityMessage> {
    console.log('Posting message:', message);
    
    const { data, error } = await supabase
      .from('community_messages')
      .insert({ ...message, flagged: false })
      .select()
      .single();

    if (error) {
      console.error('Error posting message:', error);
      
      // Provide helpful error messages
      if (error.message.includes('relation "community_messages" does not exist')) {
        throw new Error('Database tables not set up. Please run SETUP_COMMUNITY_DB.sql in Supabase.');
      }
      if (error.message.includes('violates row-level security policy')) {
        throw new Error('Permission denied. Please check RLS policies in Supabase.');
      }
      
      throw new Error(error.message || 'Failed to post message');
    }

    console.log('Message posted successfully:', data);
    return data;
  },

  // Flag a message
  async flagMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('community_messages')
      .update({ flagged: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error flagging message:', error);
      throw error;
    }
  },

  // Subscribe to new messages in a channel
  subscribeToChannel(channelId: string, callback: (message: CommunityMessage) => void) {
    return supabase
      .channel(`community:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          callback(payload.new as CommunityMessage);
        }
      )
      .subscribe();
  },

  // Generate anonymous username
  generateAnonymousUsername(): string {
    const adjectives = ['Kind', 'Brave', 'Gentle', 'Strong', 'Peaceful', 'Calm', 'Hopeful', 'Bright'];
    const nouns = ['Heart', 'Soul', 'Spirit', 'Mind', 'Friend', 'Companion', 'Traveler', 'Seeker'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    return `${randomAdj}${randomNoun}${randomNum}`;
  }
};
