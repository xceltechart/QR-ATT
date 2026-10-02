import { supabase } from './supabase';

export type Event = {
  eventId: string;
  title: string;
  start: string;
  end: string;
};

export type CloudEvent = {
  id: string;
  event_code: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  created_by?: string | null;
  created_at?: string;
};

export async function createEvent(event: Event) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { data: null, error: authError ?? new Error('You must be signed in.') };
  }

  const { data, error } = await supabase
    .from('events')
    .upsert(
      {
        event_code: event.eventId,
        title: event.title,
        start_time: event.start,
        end_time: event.end,
        created_by: authData.user.id,
      },
      { onConflict: 'event_code' }
    )
    .select('*')
    .single();

  if (error) {
    return { data, error: new Error(describeEventError(error.message)) };
  }

  return { data, error };
}

function describeEventError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'The database blocked event creation. Your account must have the Teacher role - open the Profile tab, set Account type to Teacher, save, and try again.';
  }
  if (lower.includes('does not exist') || lower.includes('relation')) {
    return 'The events table is missing. Open your Supabase dashboard, run supabase/schema.sql in the SQL Editor, and try again.';
  }
  return message;
}

export async function getEventsByTeacher(teacherId: string): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });
  return error ? [] : ((data ?? []) as CloudEvent[]);
}

export async function getEventByCode(code: string): Promise<CloudEvent | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_code', code)
    .maybeSingle();
  return error ? null : (data as CloudEvent | null);
}
