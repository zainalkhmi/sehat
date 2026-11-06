import { SupabaseClient } from '@supabase/supabase-js';
import {
  SpeziAccountService,
  SpeziUser,
  SpeziUserProfile,
  SpeziLoginCredentials,
  SpeziRegisterCredentials,
  SpeziPersonName,
} from './types.ts';

export class SupabaseAccountService implements SpeziAccountService {
  private currentUser: SpeziUser | null = null;
  private authSubscribers = new Set<(user: SpeziUser | null) => void>();

  constructor(private client: SupabaseClient) {}

  async initialize(): Promise<void> {
    const { data: { session } } = await this.client.auth.getSession();
    if (session?.user) {
      this.currentUser = await this.fetchUserProfile(session.user.id, session.user.email ?? null);
    }

    this.client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        this.currentUser = await this.fetchUserProfile(session.user.id, session.user.email ?? null);
      } else {
        this.currentUser = null;
      }
      this.notifySubscribers();
    });
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }

  async getCurrentUser(): Promise<SpeziUser | null> {
    return this.currentUser;
  }

  async login(credentials: SpeziLoginCredentials): Promise<void> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;
    if (data.user) {
      this.currentUser = await this.fetchUserProfile(data.user.id, data.user.email ?? null);
      this.notifySubscribers();
    }
  }

  async register(credentials: SpeziRegisterCredentials): Promise<void> {
    const nameObj: SpeziPersonName = typeof credentials.name === 'string'
      ? { givenName: credentials.name }
      : credentials.name || {};

    const { data, error } = await this.client.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          role: credentials.role || 'patient',
          given_name: nameObj.givenName,
          family_name: nameObj.familyName,
          date_of_birth: credentials.dateOfBirth?.toISOString().split('T')[0],
          gender: credentials.sex,
        },
      },
    });
    if (error) throw error;
    if (data.user) {
      this.currentUser = await this.fetchUserProfile(data.user.id, data.user.email ?? null);
      this.notifySubscribers();
    }
  }

  async logout(): Promise<void> {
    await this.client.auth.signOut();
    this.currentUser = null;
    this.notifySubscribers();
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async updateProfile(updates: Partial<SpeziUserProfile>): Promise<void> {
    if (!this.currentUser) throw new Error('Not authenticated');

    const updatePayload: Record<string, any> = {};
    if (updates.name) updatePayload.name_components = updates.name;
    if (updates.phoneNumber) updatePayload.phone_number = updates.phoneNumber;
    if (updates.biography) updatePayload.biography = updates.biography;
    if (updates.profileImageUrl) updatePayload.avatar_url = updates.profileImageUrl;
    if (updates.dateOfBirth) {
      updatePayload.date_of_birth = updates.dateOfBirth instanceof Date
        ? updates.dateOfBirth.toISOString().split('T')[0]
        : updates.dateOfBirth;
    }
    if (updates.sex) updatePayload.gender = updates.sex;

    const { error } = await this.client
      .from('profiles')
      .update(updatePayload)
      .eq('id', this.currentUser.uid);

    if (error) throw error;
    this.currentUser = { ...this.currentUser, ...updates };
    this.notifySubscribers();
  }

  onAuthStateChanged(callback: (user: SpeziUser | null) => void): () => void {
    this.authSubscribers.add(callback);
    callback(this.currentUser);
    return () => {
      this.authSubscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    for (const sub of this.authSubscribers) {
      sub(this.currentUser);
    }
  }

  private async fetchUserProfile(uid: string, email: string | null): Promise<SpeziUser> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error || !data) {
        return { uid, email };
      }

      return {
        uid,
        email,
        name: data.name_components as SpeziPersonName,
        dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        sex: data.gender,
        phoneNumber: data.phone_number,
        biography: data.biography,
        profileImageUrl: data.avatar_url,
        role: data.role,
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      };
    } catch {
      return { uid, email };
    }
  }
}

