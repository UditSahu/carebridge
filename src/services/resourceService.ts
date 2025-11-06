import { supabase, Resource, UserPreference, SavedResource } from '@/lib/supabase';

export const resourceService = {
  // Get all resources
  async getAllResources(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }

    return data || [];
  },

  // Get resources by category
  async getResourcesByCategory(category: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources by category:', error);
      throw error;
    }

    return data || [];
  },

  // Get resources by type
  async getResourcesByType(type: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources by type:', error);
      throw error;
    }

    return data || [];
  },

  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user preferences:', error);
      throw error;
    }

    return data;
  },

  // Save or update user preferences
  async saveUserPreferences(
    userId: string,
    concerns: string[],
    preferredFormats: string[]
  ): Promise<UserPreference> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        concerns,
        preferred_formats: preferredFormats
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }

    return data;
  },

  // Get personalized recommendations
  async getRecommendations(userId: string): Promise<Resource[]> {
    const preferences = await this.getUserPreferences(userId);
    
    if (!preferences || !preferences.concerns?.length) {
      return this.getAllResources();
    }

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .or(
        preferences.concerns.map(concern => `category.ilike.%${concern}%`).join(',')
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recommendations:', error);
      return this.getAllResources();
    }

    return data || [];
  },

  // Save a resource for later
  async saveResource(userId: string, resourceId: string): Promise<SavedResource> {
    const { data, error } = await supabase
      .from('saved_resources')
      .insert({
        user_id: userId,
        resource_id: resourceId
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving resource:', error);
      throw error;
    }

    return data;
  },

  // Remove a saved resource
  async removeSavedResource(userId: string, resourceId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_resources')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId);

    if (error) {
      console.error('Error removing saved resource:', error);
      throw error;
    }
  },

  // Get user's saved resources
  async getSavedResources(userId: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('saved_resources')
      .select(`
        resource_id,
        resources (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching saved resources:', error);
      throw error;
    }

    return (data?.map(item => (item as any).resources) || []) as Resource[];
  },

  // Check if a resource is saved
  async isResourceSaved(userId: string, resourceId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_resources')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking saved resource:', error);
      return false;
    }

    return !!data;
  }
};
