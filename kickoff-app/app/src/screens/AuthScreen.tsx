import { useEffect, useState, type CSSProperties } from 'react';
import { Icon } from '../components/Icon';
import { KickoffLogo } from '../components/KickoffLogo';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

type Mode = null | 'login' | 'signup';

interface AuthScreenProps {
  onLoggedIn: () => void;
  onSignedUp: () => void;
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 14,
  border: '1.5px solid var(--border)',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  background: 'var(--bg)',
  color: 'var(--text)',
  marginBottom: 12,
};

export function AuthScreen({ onLoggedIn, onSignedUp }: AuthScreenProps) {
  const { signIn, signUp, signInWithProvider } = useAuth();
  const [mode, setMode] = useState<Mode>(null);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const doLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      await signIn(email, pass);
      onLoggedIn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const doSignup = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUp(email, pass, name);
      // If email confirmation is off, a session exists immediately — go straight
      // into the skill assessment. Otherwise, ask them to confirm first.
      const { data } = await supabase.auth.getSession();
      if (data.session) onSignedUp();
      else setCheckEmail(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const doProvider = async (provider: 'google' | 'facebook' | 'apple') => {
    setError(null);
    try {
      await signInWithProvider(provider);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (checkEmail) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name="msg" size={26} color="var(--green)" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Check your inbox</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>We sent a confirmation link to {email}. Confirm it, then log in.</div>
        <button
          onClick={() => {
            setCheckEmail(false);
            setMode('login');
          }}
          style={{ marginTop: 24, padding: '12px 24px', borderRadius: 14, background: 'var(--green)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Back to Log In
        </button>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px 24px 40px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontFamily: 'inherit' }}>
          <Icon name="back" size={18} /> Back
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 6 }}>Welcome back</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>Log in to see your games & squad</div>
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" style={inputStyle} />
          <input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" type="password" style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && doLogin()} />
          {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <div style={{ textAlign: 'right', marginBottom: 24, marginTop: -4 }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Forgot password?</button>
          </div>
          <button
            onClick={doLogin}
            disabled={busy}
            style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: 16, opacity: busy ? 0.7 : 1 }}
          >
            {busy ? 'Logging in…' : 'Log In'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <SocialButtons onSelect={doProvider} />
        </div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px 24px 40px',
          overflowY: 'auto',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontFamily: 'inherit' }}>
          <Icon name="back" size={18} /> Back
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 16 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 6 }}>Create account</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>Join thousands of players near you</div>
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" style={inputStyle} />
          <input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password (8+ characters)" type="password" style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && doSignup()} />
          {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>
            🔒 Your details are safe — we never share your data
          </div>
          <button
            onClick={doSignup}
            disabled={busy}
            style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: 12, opacity: busy ? 0.7 : 1 }}
          >
            {busy ? 'Creating account…' : 'Create Account'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
            By continuing you agree to our <span style={{ color: 'var(--text2)', fontWeight: 500 }}>Terms of Service</span> and{' '}
            <span style={{ color: 'var(--text2)', fontWeight: 500 }}>Privacy Policy</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          flex: '0 0 55%',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.1s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.1)', top: -40, right: -60 }} />
        <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.08)', bottom: 20, left: -30 }} />
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <KickoffLogo size={72} color="white" />
          <div style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: -1.5, marginTop: 12, lineHeight: 1 }}>Kickoff</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 8, letterSpacing: 1.5, fontWeight: 400, textTransform: 'uppercase' }}>Your Game, Your Squad</div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: 'var(--bg2)',
          padding: '32px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          marginTop: -24,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.5s ease 0.25s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.08)',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 8, letterSpacing: -0.3 }}>Find your next game</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 28 }}>
            Join local 5-a-side, 7-a-side and 11-a-side games near you. Pay, chat, and play.
          </div>
          <button
            onClick={() => setMode('signup')}
            style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12, boxShadow: '0 4px 20px oklch(0.50 0.16 145 / 0.35)' }}
          >
            Get Started
          </button>
          <button
            onClick={() => setMode('login')}
            style={{ width: '100%', padding: '15px', borderRadius: 16, background: 'transparent', border: '1.5px solid var(--border)', fontWeight: 600, fontSize: 15, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Log In
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>Join 40,000+ players already on Kickoff</div>
      </div>
    </div>
  );
}

function SocialButtons({ onSelect }: { onSelect: (provider: 'google' | 'facebook' | 'apple') => void }) {
  const btn: CSSProperties = { flex: 1, padding: '12px 8px', borderRadius: 14, background: 'var(--bg2)', border: '1.5px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 };
  const label: CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text)' };
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button onClick={() => onSelect('google')} style={btn}>
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.07 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.57-13.45-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        <span style={label}>Google</span>
      </button>
      <button onClick={() => onSelect('facebook')} style={btn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span style={label}>Facebook</span>
      </button>
      <button onClick={() => onSelect('apple')} style={btn}>
        <svg width="16" height="18" viewBox="0 0 814 1000" fill="var(--text)">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 405.8 7.5 274 7.5 148.8c0-75.5 27.9-154.7 79.4-207.7C138.4-111.3 209.6-142 280.8-142c69.4 0 127.5 31.7 169.2 31.7 40.8 0 110.3-34.5 188.2-34.5 32.5 0 108.2 3.9 156.5 70.1z" />
        </svg>
        <span style={label}>Apple</span>
      </button>
    </div>
  );
}
