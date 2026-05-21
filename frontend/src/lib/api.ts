import { createClient } from './supabase';
import type { Task, CreateTaskPayload, UpdateTaskPayload, Profile } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const getMe = () => apiFetch<Profile>('/api/auth/me');

// Tasks
export const getTasks = () => apiFetch<Task[]>('/api/tasks');
export const getTask = (id: string) => apiFetch<Task>(`/api/tasks/${id}`);
export const createTask = (data: CreateTaskPayload) =>
  apiFetch<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTask = (id: string, data: UpdateTaskPayload) =>
  apiFetch<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTask = (id: string) =>
  apiFetch<{ message: string }>(`/api/tasks/${id}`, { method: 'DELETE' });

// Users
export const getUsers = () => apiFetch<Profile[]>('/api/users');
