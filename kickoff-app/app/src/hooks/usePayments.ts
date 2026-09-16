import { supabase } from '../lib/supabase';

interface CreateIntentResponse {
  clientSecret: string;
  paymentId: string;
}

export async function createPaymentIntent(gameId: string, userId: string, amount: number): Promise<CreateIntentResponse> {
  const { data: payment, error: insertError } = await supabase
    .from('payments')
    .insert({ user_id: userId, game_id: gameId, amount })
    .select('id')
    .single();
  if (insertError) throw insertError;

  const { data, error } = await supabase.functions.invoke<{ clientSecret: string }>('create-payment-intent', {
    body: { paymentId: payment.id, amountPence: Math.round(amount * 100) },
  });
  if (error) throw error;
  if (!data?.clientSecret) throw new Error('Stripe did not return a client secret.');
  return { clientSecret: data.clientSecret, paymentId: payment.id };
}

export async function confirmPayment(paymentId: string, paymentIntentId: string) {
  const { error } = await supabase.functions.invoke('confirm-payment', {
    body: { paymentId, paymentIntentId },
  });
  if (error) throw error;
}
