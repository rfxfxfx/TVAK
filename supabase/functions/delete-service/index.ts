import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'shared/cors.ts';

interface RequestBody {
  service_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { service_id }: RequestBody = await req.json();
    if (!service_id) {
      throw new Error('Missing required field: service_id');
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

    // 3. If the user is an admin, create a privileged client to perform the deletion.
    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Fetch the service to get the image_url before deleting the record.
    const { data: service, error: serviceError } = await adminSupabaseClient.from('services').select('image_url').eq('id', service_id).single();
    if (serviceError) throw new Error('Service not found.');

    // 5. Delete the service record from the database.
    const { error: deleteError } = await adminSupabaseClient.from('services').delete().eq('id', service_id);
    if (deleteError) throw deleteError;

    // 6. If the service had an image, delete it from storage.
    if (service.image_url) {
      await adminSupabaseClient.storage.from('services').remove([service.image_url]);
    }

    return new Response(JSON.stringify({ message: 'Service deleted successfully' }), {
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