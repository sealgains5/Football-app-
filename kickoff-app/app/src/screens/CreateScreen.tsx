import { useState, type CSSProperties } from 'react';
import { Icon } from '../components/Icon';
import { createGame, type NewGameInput } from '../hooks/useGames';
import type { GameFormat } from '../types/database';
import type { NavigateFn } from '../types/nav';

const STEPS = ['Format & Details', 'Location & Time', 'Players & Cost', 'Privacy'];
const inputStyle: CSSProperties = { width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'var(--bg)', color: 'var(--text)', marginBottom: 14 };
const labelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' };

interface CreateScreenProps {
  navigate: NavigateFn;
  organiserId?: string;
  onCreated: (gameId: string) => void;
}

interface FormState {
  title: string;
  format: GameFormat;
  pitch: string;
  skill: string;
  location: string;
  date: string;
  time: string;
  spots: string;
  cost: string;
  isPrivate: boolean;
}

const spotOptions: Record<GameFormat, string[]> = {
  '5-a-side': ['8', '10', '12'],
  '7-a-side': ['12', '14', '16'],
  '11-a-side': ['18', '20', '22'],
};

export function CreateScreen({ navigate, organiserId, onCreated }: CreateScreenProps) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ title: '', format: '5-a-side', pitch: 'Astroturf', skill: 'All levels', location: '', date: '', time: '', spots: '10', cost: '', isPrivate: false });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!organiserId) return;
    setBusy(true);
    setError(null);
    const input: NewGameInput = {
      title: form.title || `${form.format} at ${form.location || 'TBC'}`,
      format: form.format,
      date: form.date || new Date().toISOString().slice(0, 10),
      time: form.time || 'TBC',
      location: form.location || 'TBC',
      pitch: form.pitch,
      spots: parseInt(form.spots, 10) || 10,
      cost: parseFloat(form.cost) || 0,
      skill: form.skill,
      isPrivate: form.isPrivate,
    };
    try {
      const gameId = await createGame(organiserId, input);
      onCreated(gameId);
      navigate('home');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg2)', padding: '14px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={() => (step === 0 ? navigate('back') : setStep((s) => s - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex' }}>
            <Icon name="back" size={22} />
          </button>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Create Game</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? 'var(--green)' : 'var(--border)' }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {step === 0 && (
          <>
            <label style={labelStyle}>Game title (optional)</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Saturday Morning 5s" style={inputStyle} />
            <label style={labelStyle}>Format</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {(['5-a-side', '7-a-side', '11-a-side'] as GameFormat[]).map((f) => (
                <button key={f} onClick={() => set('format', f)} style={choiceStyle(form.format === f)}>
                  {f}
                </button>
              ))}
            </div>
            <label style={labelStyle}>Pitch surface</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {['Grass', 'Astroturf', '3G', 'Indoor'].map((p) => (
                <button key={p} onClick={() => set('pitch', p)} style={choiceStyle(form.pitch === p, 12)}>
                  {p}
                </button>
              ))}
            </div>
            <label style={labelStyle}>Skill level</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {['All levels', 'Beginner', 'Intermediate', 'Advanced'].map((s) => (
                <button key={s} onClick={() => set('skill', s)} style={{ ...choiceStyle(form.skill === s, 13), flex: 'none', padding: '10px 14px' }}>
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <label style={labelStyle}>Location / Pitch name</label>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Hackney Marshes, E9" style={inputStyle} />
            <label style={labelStyle}>Date</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={inputStyle} />
            <label style={labelStyle}>Kick-off time</label>
            <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} style={inputStyle} />
          </>
        )}
        {step === 2 && (
          <>
            <label style={labelStyle}>Max players</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {spotOptions[form.format].map((n) => (
                <button key={n} onClick={() => set('spots', n)} style={{ ...choiceStyle(form.spots === n), fontSize: 16 }}>
                  {n}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Players can join waitlist once full</div>
            <label style={labelStyle}>Cost per player (£)</label>
            <input type="number" value={form.cost} onChange={(e) => set('cost', e.target.value)} placeholder="0 = free" style={inputStyle} />
            <div style={{ background: 'oklch(0.96 0.04 145)', borderRadius: 12, padding: '12px 14px', border: '1px solid oklch(0.88 0.08 145)', fontSize: 13, color: 'var(--green)' }}>
              💡 Estimated total: £{(parseFloat(form.cost) || 0) * (parseInt(form.spots, 10) || 10)} collected
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Private game</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>Only invited players can see & join</div>
                </div>
                <div onClick={() => set('isPrivate', !form.isPrivate)} style={{ width: 50, height: 28, borderRadius: 14, background: form.isPrivate ? 'var(--green)' : 'var(--border)', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: form.isPrivate ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: 16, marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: 'var(--text2)' }}>Game summary</div>
              {(
                [
                  ['Format', form.format],
                  ['Location', form.location || '—'],
                  ['Date', form.date || '—'],
                  ['Kick-off', form.time || '—'],
                  ['Spots', form.spots],
                  ['Cost', form.cost ? `£${form.cost}/player` : 'Free'],
                  ['Skill', form.skill],
                  ['Pitch', form.pitch],
                ] as const
              ).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text2)' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}
          </>
        )}
      </div>

      <div style={{ padding: '12px 20px 20px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} style={{ width: '100%', padding: 15, borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
            Continue
          </button>
        ) : (
          <button onClick={submit} disabled={busy} style={{ width: '100%', padding: 15, borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Creating…' : 'Create Game 🎉'}
          </button>
        )}
      </div>
    </div>
  );
}

function choiceStyle(active: boolean, fontSize = 13): CSSProperties {
  return {
    flex: 1,
    padding: '12px 6px',
    borderRadius: 12,
    border: active ? '2px solid var(--green)' : '1.5px solid var(--border)',
    background: active ? 'var(--green-light)' : 'var(--bg2)',
    color: active ? 'var(--green)' : 'var(--text2)',
    fontWeight: active ? 700 : 400,
    fontSize,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
