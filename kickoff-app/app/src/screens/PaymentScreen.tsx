import { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Icon } from '../components/Icon';
import { joinGame } from '../hooks/useGames';
import { confirmPayment, createPaymentIntent } from '../hooks/usePayments';
import { getStripe } from '../lib/stripe';
import { formatDate, type Game } from '../types/domain';
import type { NavigateFn } from '../types/nav';

interface PaymentScreenProps {
  game: Game;
  navigate: NavigateFn;
  myId?: string;
  onPaid: () => void;
}

const BOOKING_FEE = 0.5;

export function PaymentScreen({ game, navigate, myId, onPaid }: PaymentScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const total = game.cost + BOOKING_FEE;

  const startCheckout = async () => {
    if (!myId) return;
    setStarting(true);
    setError(null);
    try {
      await joinGame(game.id, myId, { isFull: false });
      const { clientSecret: secret, paymentId: id } = await createPaymentIntent(game.id, myId, total);
      setClientSecret(secret);
      setPaymentId(id);
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg2)', padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('back')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex' }}>
          <Icon name="back" size={22} />
        </button>
        <div style={{ fontWeight: 700, fontSize: 17 }}>Payment</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {step === 1 && (
          <>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Order Summary</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text2)', fontSize: 14 }}>{game.title}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>£{game.cost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text2)', fontSize: 14 }}>Booking fee</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>£{BOOKING_FEE.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>£{total.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 16px', marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
              Secured by Stripe · test mode — use card <span style={{ fontWeight: 600, color: 'var(--text)' }}>4242 4242 4242 4242</span>, any future expiry, any CVC.
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <button
              onClick={startCheckout}
              disabled={starting}
              style={{ width: '100%', padding: 15, borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: starting ? 'default' : 'pointer', fontFamily: 'inherit', opacity: starting ? 0.7 : 1 }}
            >
              {starting ? 'Preparing checkout…' : `Pay £${total.toFixed(2)}`}
            </button>
          </>
        )}

        {step === 2 && clientSecret && paymentId && (
          <Elements stripe={getStripe()} options={{ clientSecret }}>
            <CheckoutForm
              total={total}
              paymentId={paymentId}
              onSuccess={() => setStep(3)}
              onError={(m) => setError(m)}
            />
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</div>}
          </Elements>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-light)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={36} color="var(--green)" strokeWidth={2.5} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>You're in!</div>
            <div style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 30 }}>Payment of £{total.toFixed(2)} confirmed. See you on the pitch!</div>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: 16, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>{game.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <Icon name="clock" size={13} color="var(--text3)" />
                {formatDate(game.date)} · {game.time}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', gap: 6, alignItems: 'center' }}>
                <Icon name="pin" size={13} color="var(--text3)" />
                {game.location}
              </div>
            </div>
            <button
              onClick={() => {
                onPaid();
                navigate('home');
              }}
              style={{ width: '100%', padding: 15, borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutForm({ total, paymentId, onSuccess, onError }: { total: number; paymentId: string; onSuccess: () => void; onError: (m: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (error) {
      onError(error.message ?? 'Payment failed');
      setSubmitting(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await confirmPayment(paymentId, paymentIntent.id);
        onSuccess();
      } catch (err) {
        onError((err as Error).message);
      }
    }
    setSubmitting(false);
  };

  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Card details</div>
      <PaymentElement />
      <button
        onClick={pay}
        disabled={!stripe || submitting}
        style={{ width: '100%', padding: 15, borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', marginTop: 16, opacity: submitting ? 0.7 : 1 }}
      >
        {submitting ? 'Processing…' : `Pay £${total.toFixed(2)}`}
      </button>
    </div>
  );
}
