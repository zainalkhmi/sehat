/**
 * Spezi-compatible types for Supabase Adapter
 */
import { UserRole } from '@future-health/domain';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SpeziPersonName {
  givenName?: string;
  middleName?: string;
  familyName?: string;
  prefix?: string;
  suffix?: string;
}

export interface SpeziUserProfile {
  name?: SpeziPersonName;
  dateOfBirth?: Date;
  sex?: string;
  phoneNumber?: string;
  biography?: string;
  profileImageUrl?: string;
  role?: UserRole;
}

export interface SpeziUser extends SpeziUserProfile {
  uid: string;
  email: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SpeziLoginCredentials {
  email: string;
  password: string;
}

export interface SpeziRegisterCredentials {
  email: string;
  password: string;
  name?: SpeziPersonName | string;
  dateOfBirth?: Date;
  sex?: string;
  role?: UserRole;
}

export interface SpeziAccountService {
  initialize(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  getCurrentUser(): Promise<SpeziUser | null>;
  login(credentials: SpeziLoginCredentials): Promise<void>;
  register(credentials: SpeziRegisterCredentials): Promise<void>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updateProfile(updates: Partial<SpeziUserProfile>): Promise<void>;
  onAuthStateChanged(callback: (user: SpeziUser | null) => void): () => void;
}

export interface SpeziTask {
  id: string;
  title: string;
  category: 'questionnaire' | 'task' | 'reminder' | 'measurement';
  schedule?: {
    type: 'daily' | 'weekly' | 'monthly' | 'once';
    [key: string]: unknown;
  };
  questionnaireId?: string;
  [key: string]: unknown;
}

export interface SpeziOutcome {
  id: string;
  completedAt: Date;
  [key: string]: unknown;
}

export interface SpeziSchedulerState {
  tasks: SpeziTask[];
  outcomes: SpeziOutcome[];
}

export interface SpeziBackendService {
  initialize(): Promise<void>;
  setUserId(userId: string | null): void;
  loadSchedulerState(): Promise<SpeziSchedulerState | null>;
  saveSchedulerState(state: SpeziSchedulerState): Promise<void>;
  createTask(task: SpeziTask): Promise<SpeziTask>;
  updateTask(task: SpeziTask): Promise<SpeziTask>;
  deleteTask(taskId: string): Promise<void>;
  getTasks(): Promise<SpeziTask[]>;
  createOutcome(outcome: SpeziOutcome): Promise<SpeziOutcome>;
  getOutcomes(): Promise<SpeziOutcome[]>;
  saveQuestionnaireResponse(response: any): Promise<void>;
  getQuestionnaireResponses(taskId?: string): Promise<any[]>;
  syncToRemote(): Promise<void>;
  syncFromRemote(): Promise<void>;
}

