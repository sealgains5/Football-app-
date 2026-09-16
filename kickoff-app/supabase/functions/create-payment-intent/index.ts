// Supabase Edge Function: create-payment-intent
//
// Creates a Stripe (test mode) PaymentIntent for a pending `payments` row and
// stores the PaymentIntent id back on that row. The Stripe secret key never
// reaches the client — only this server-side function holds it.
//
// Deploy: supabase functions deploy create-payment-intent
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

    const { paymentId, amountPence } = await req.json();
    if (!paymentId || !amountPence) {
      return new Response(JSON.stringify({ error: 'paymentId and amountPence are required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('id, user_id, status')
      .eq('id', paymentId)
      .single();
    if (fetchError || !payment) {
      return new Response(JSON.stringify({ error: 'Payment not found' }), { status: 404, headers: corsHeaders });
    }
    if (payment.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    const intent = await stripe.paymentIntents.create({
      amount: amountPence,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: { payment_id: paymentId, user_id: userData.user.id },
    });

    await supabaseAdmin.from('payments').update({ stripe_payment_intent_id: intent.id }).eq('id', paymentId);

    return new Response(JSON.stringify({ clientSecret: intent.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
  }
});
