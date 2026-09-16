// Supabase Edge Function: confirm-payment
//
// After the client confirms the card payment with Stripe.js, it calls this
// function with the PaymentIntent id. We re-check the PaymentIntent's status
// directly with Stripe (server-side, using the secret key) rather than
// trusting the client, then mark the payment + the player's roster row as paid.
//
// Deploy: supabase functions deploy confirm-payment
// Secrets: supabase secrets set STRIPE_SECRET_KEY=sk_test_... SUPABASE_SERVICE_ROLE_KEY=...

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' });

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const { data: userData, error: authError } = await createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { paymentId, paymentIntentId } = await req.json();
    if (!paymentId || !paymentIntentId) {
      return new Response(JSON.stringify({ error: 'paymentId and paymentIntentId are required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('id, user_id, game_id')
      .eq('id', paymentId)
      .single();
    if (fetchError || !payment || payment.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const succeeded = intent.status === 'succeeded';

    await supabaseAdmin
      .from('payments')
      .update({ status: succeeded ? 'succeeded' : 'failed' })
      .eq('id', paymentId);

    if (succeeded) {
      await supabaseAdmin
        .from('game_players')
        .update({ paid: true, status: 'joined' })
        .eq('game_id', payment.game_id)
        .eq('player_id', payment.user_id);
    }

    return new Response(JSON.stringify({ status: succeeded ? 'succeeded' : 'failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
  }
});
