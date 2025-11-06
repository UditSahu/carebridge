import { supabase, ChatMessage } from '@/lib/supabase';

export const chatService = {
  // Get chat history for a user
  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }

    return data || [];
  },

  // Save a chat message
  async saveChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }

    return data;
  },

  // Delete chat history for a user
  async deleteChatHistory(userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  },

  // Get citation sources
  async getCitationSources(ids: number[]) {
    const { data, error } = await supabase
      .from('citation_sources')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error fetching citation sources:', error);
      throw error;
    }

    return data || [];
  },

  // Get all citation sources
  async getAllCitationSources() {
    const { data, error } = await supabase
      .from('citation_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching citation sources:', error);
      throw error;
    }

    return data || [];
  }
};
