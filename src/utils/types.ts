export type TransactionType = 'income' | 'expense';

// --- Backend API types ---

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  comment: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  categories: {
    id: string;
    name: string;
    type: TransactionType;
    color: string;
  };
}

// --- Auth types ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export type CurrentUser = AuthUser & { name?: string; avatar_url?: string };

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
}

// --- Form / UI types ---

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  category_id: string;
  comment: string;
  transaction_date: string;
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  category: string;
  type: TransactionType | 'all';
}

// --- API error ---

export interface ApiError {
  error: string;
  details?: string[];
}
