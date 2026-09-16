import { useState } from 'react';
import { Icon } from '../components/Icon';
import { ASSESSMENT_QUESTIONS, computeRating, ratingLabel, submitSkillAssessment, type SkillAnswers, type SkillKey } from '../hooks/useSkillAssessment';

const SKILL_COLORS: Record<SkillKey, string> = {
  pace: '#e07b30',
  shooting: '#cc3333',
  passing: '#2a7acc',
  dribbling: '#8b44cc',
  defending: '#1a8c4e',
  fitness: '#cc8800',
  experience: '#555',
  iq: '#2a8c8c',
};

interface SkillAssessmentScreenProps {
  userId: string;
  onComplete: (rating: number) => void;
}

export function SkillAssessmentScreen({ userId, onComplete }: SkillAssessmentScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SkillAnswers>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalQ = ASSESSMENT_QUESTIONS.length;
  const isResults = step === totalQ;
  const q = ASSESSMENT_QUESTIONS[step];

  const handleNext = () => {
    if (selected === null) return;
    const next = { ...answers, [q.key]: selected };
    setAnimating(true);
    setTimeout(() => {
      setAnswers(next);
      setSelected(null);
      setStep((s) => s + 1);
      setAnimating(false);
    }, 220);
  };

  const save = async () => {
    setSaving(true);
    const rating = await submitSkillAssessment(userId, answers as SkillAnswers);
    setSaving(false);
    onComplete(rating);
  };

  if (isResults) {
    const rating = computeRating(answers as SkillAnswers);
    return (
      <div style={{ height: '100%', background: 'var(--bg)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#0a0a0a', padding: '28px 24px 32px' }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: 'white', marginBottom: 4 }}>Your Skill Rating</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Based on your self-assessment</div>
        </div>
        <div style={{ padding: '0 20px', marginTop: -20 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 20, border: '1px solid var(--border)', padding: '24px 20px', boxShadow: 'var(--shadow-md)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{rating.toFixed(1)}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>out of 5.0</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>{ratingLabel(rating)}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                  Confidence: <span style={{ color: 'var(--amber)', fontWeight: 600 }}>40%</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Play more games to increase</div>
              </div>
            </div>
            {ASSESSMENT_QUESTIONS.map(({ key, label }) => {
              const val = answers[key] ?? 1;
              const pct = (val / 5) * 100;
              return (
                <div key={key} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: SKILL_COLORS[key] }}>{val.toFixed(1)}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 5, background: 'var(--bg)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: SKILL_COLORS[key], borderRadius: 5 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={save}
            disabled={saving}
            style={{ width: '100%', padding: 16, borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: 30, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : 'Save & Go to Profile'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--bg2)', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>Skill Assessment</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            {step + 1} / {totalQ}
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 5, background: 'var(--bg)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / totalQ) * 100}%`, background: 'var(--green)', borderRadius: 5, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: '28px 20px 20px', display: 'flex', flexDirection: 'column', opacity: animating ? 0 : 1, transition: 'opacity 0.2s' }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--green-light)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={q.icon} size={24} color="var(--green)" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 8 }}>{q.label}</div>
          <div style={{ fontWeight: 700, fontSize: 19, color: 'var(--text)', lineHeight: 1.3 }}>{q.question}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.opts.map((opt, i) => {
            const val = i + 1;
            const isSelected = selected === val;
            return (
              <button
                key={opt}
                onClick={() => setSelected(val)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: isSelected ? '2px solid var(--green)' : '1.5px solid var(--border)',
                  background: isSelected ? 'var(--green-light)' : 'var(--bg2)',
                  color: isSelected ? 'var(--green)' : 'var(--text)',
                  fontWeight: isSelected ? 700 : 400,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{opt}</span>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: isSelected ? '2px solid var(--green)' : '2px solid var(--border)',
                    background: isSelected ? 'var(--green)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && <Icon name="check" size={12} color="white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '12px 20px 36px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={handleNext}
          disabled={selected === null}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 14,
            background: selected !== null ? 'var(--green)' : 'var(--border)',
            border: 'none',
            fontWeight: 700,
            fontSize: 16,
            color: selected !== null ? 'white' : 'var(--text3)',
            cursor: selected !== null ? 'pointer' : 'default',
            fontFamily: 'inherit',
          }}
        >
          {step < totalQ - 1 ? 'Next' : 'See My Rating'}
        </button>
      </div>
    </div>
  );
}
