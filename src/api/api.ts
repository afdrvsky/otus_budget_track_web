import client from './client';
import type {
  AuthResponse,
  Category,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  Transaction,
  TransactionFormData,
  TransactionType,
} from '../utils/types';

// --- Auth ---

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/register', data);
  return res.data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function recoverPassword(email: string): Promise<void> {
  await client.post('/auth/recover', { email });
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await client.get<CurrentUser>('/user');
  return res.data;
}

export function getGoogleLoginUrl(): string {
  const base =
    import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '');
  return `${base}/auth/google`;
}

// --- Transactions ---

interface TransactionQueryParams {
  type?: TransactionType;
  category_id?: string;
  date_from?: string;
  date_to?: string;
}

export async function fetchTransactions(params?: TransactionQueryParams): Promise<Transaction[]> {
  const res = await client.get<Transaction[]>('/transactions', { params });
  return res.data;
}

export async function createTransaction(data: TransactionFormData): Promise<Transaction> {
  const res = await client.post<Transaction>('/transactions', {
    category_id: data.category_id,
    amount: Number(data.amount),
    type: data.type,
    transaction_date: data.transaction_date,
    comment: data.comment,
  });
  return res.data;
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionFormData>
): Promise<Transaction> {
  const res = await client.put<Transaction>(`/transactions/${id}`, {
    ...(data.category_id && { category_id: data.category_id }),
    ...(data.amount && { amount: Number(data.amount) }),
    ...(data.type && { type: data.type }),
    ...(data.transaction_date && { transaction_date: data.transaction_date }),
    ...(data.comment !== undefined && { comment: data.comment }),
  });
  return res.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await client.delete(`/transactions/${id}`);
}

// --- Categories ---

export async function fetchCategories(type?: TransactionType): Promise<Category[]> {
  const res = await client.get<Category[]>('/categories', { params: type ? { type } : {} });
  return res.data;
}

export async function addCategory(
  name: string,
  type: TransactionType,
  color: string
): Promise<Category> {
  const res = await client.post<Category>('/categories', { name, type, color });
  return res.data;
}

export async function updateCategory(
  id: string,
  updates: { name?: string; color?: string }
): Promise<Category> {
  const res = await client.put<Category>(`/categories/${id}`, updates);
  return res.data;
}

export async function deleteCategory(id: string, reassignTo?: string): Promise<void> {
  const params = reassignTo ? { reassign_to: reassignTo } : undefined;
  await client.delete(`/categories/${id}`, { params });
}
