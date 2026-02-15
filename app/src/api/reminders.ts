import { api } from './client';

export type Reminder = {
  id: number;
  message: string;
  send_at: string; // ISO datetime
  sent: boolean;
  channel: 'email' | 'whatsapp';
};

export type ReminderCreate = {
  message: string;
  send_at: string; // ISO datetime
  channel?: 'email' | 'whatsapp';
};

export type ReminderUpdate = Partial<ReminderCreate>;

export async function listReminders(): Promise<Reminder[]> {
  return api<Reminder[]>('/reminders');
}

export async function createReminder(payload: ReminderCreate): Promise<Reminder> {
  return api<Reminder>('/reminders', { method: 'POST', body: payload });
}

export async function updateReminder(id: number, payload: ReminderUpdate): Promise<Reminder> {
  return api<Reminder>(`/reminders/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteReminder(id: number): Promise<{ message?: string } | Record<string, never>> {
  return api(`/reminders/${id}`, { method: 'DELETE' });
}

export async function runDue(): Promise<{ processed?: number } | Record<string, never>> {
  return api('/reminders/run', { method: 'POST' });
}
