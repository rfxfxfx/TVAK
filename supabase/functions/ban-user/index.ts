import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'shared/cors.ts';

interface RequestBody {
  target_user_id: string;
  // Duration in hours. 'infinity' for a permanent ban.
  ban_duration_hours: number | 'infinity';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { target_user_id, ban_duration_hours }: RequestBody = await req.json();
    if (!target_user_id || ban_duration_hours === undefined) {
      throw new Error('Missing required fields: target_user_id and ban_duration_hours');
    }

    // 1. Create a client with the authorization of the user making the request.
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

    // 3. If the user is an admin, create a privileged client to perform the ban.
    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Calculate the 'banned_until' timestamp.
    let banned_until: string;
    if (ban_duration_hours === 'infinity') {
      banned_until = '9999-12-31T23:59:59Z'; // A far-future date for permanent bans
    } else {
      const banEndDate = new Date();
      banEndDate.setHours(banEndDate.getHours() + ban_duration_hours);
      banned_until = banEndDate.toISOString();
    }

    // 5. Update the user's 'banned_until' status using the Auth Admin API.
    const { error: updateError } = await adminSupabaseClient.auth.admin.updateUserById(
      target_user_id,
      { banned_until }
    );

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ message: 'User has been banned successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});