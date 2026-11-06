import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '@future-health/domain';

export class ProfileService {
  constructor(private client: SupabaseClient) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      role: data.role,
      name: data.name_components,
      displayName: `${data.name_components?.givenName || ''} ${data.name_components?.familyName || ''}`.trim() || data.email,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      phoneNumber: data.phone_number,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await this.client
      .from('profiles')
      .update({
        name_components: updates.name,
        date_of_birth: updates.dateOfBirth,
        gender: updates.gender,
        phone_number: updates.phoneNumber,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  }
}

