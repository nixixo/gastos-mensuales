import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User operations
export async function createOrGetUser(username: string): Promise<string> {
  // Try to get existing user
  const { data: existing, error: getError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  // If user exists, return the ID
  if (existing && !getError) {
    return existing.id;
  }

  // If error is not "no rows found", re-throw
  if (getError && getError.code !== 'PGRST116') {
    console.warn('Unexpected error fetching user:', getError);
  }

  // User doesn't exist, create new one
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ username }])
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating user:', insertError);
    throw insertError;
  }

  return newUser.id;
}

export async function getUserByUsername(username: string): Promise<{ id: string; username: string } | null> {
  const { data } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', username)
    .single();

  return data;
}
