import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'shared/cors.ts';

// Define the expected request body structure for type safety.
interface RequestBody {
  target_user_id: string;
  new_role: 'free' | 'premium' | 'admin';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { target_user_id, new_role }: RequestBody = await req.json();

    // 1. Create a Supabase client with the authorization of the user making the request.
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 2. Check if the calling user is an admin.
    const { data: callerProfile, error: callerError } = await userSupabaseClient
      .from('profiles')
      .select('role')
      .single();

    if (callerError || callerProfile?.role !== 'admin') {
      throw new Error('Permission denied: User is not an admin.');
    }

    // 3. If the user is an admin, create a privileged client to perform the update.
    // This client uses the service_role key to bypass RLS.
    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Update the target user's role.
    const { error: updateError } = await adminSupabaseClient
      .from('profiles')
      .update({ role: new_role })
      .eq('id', target_user_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ message: 'User role updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});