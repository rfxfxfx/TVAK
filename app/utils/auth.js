// ...existing code...
import { supabase } from '../supabase/client';

export function signUpWithEmail(email, password, username) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });
}

export function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function resetPasswordForEmail(email) {
  return supabase.auth.resetPasswordForEmail(email);
}

export function signOut() {
  return supabase.auth.signOut();
}
// ...existing code...
