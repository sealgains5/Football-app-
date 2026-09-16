import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { supabase } from '../lib/supabase';
import type { Game } from '../types/domain';

interface PostGameRatingModalProps {
  game: Game;
  myId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function PostGameRatingModal({ game, myId, onClose, onSubmitted }: PostGameRatingModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const others = game.players.filter((p) => p.id !== myId);
  const allRated = others.every((p) => ratings[p.id] !== undefined);

  const submit = async () => {
    if (!allRated) return;
    setSubmitting(true);
    await supabase.from('ratings').upsert(
      others.map((p) => ({ game_id: game.id, rater_id: myId, ratee_id: p.id, stars: ratings[p.id] })),
      { onConflict: 'game_id,rater_id,ratee_id' }
    );
    setSubmitting(false);
    onSubmitted();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: 'var(--bg2)', borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '80%', overflowY: 'auto', padding: '20px 20px 32px' }}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 16px' }} />
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Rate your teammates</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>{game.title}</div>
        {others.map((p) => (
          <div key={p.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <Avatar initials={p.initials} size={36} imageUrl={p.avatarUrl} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatings((r) => ({ ...r, [p.id]: star }))}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: (ratings[p.id] ?? 0) >= star ? 'none' : '1.5px solid var(--border)', background: (ratings[p.id] ?? 0) >= star ? 'var(--amber)' : 'var(--bg)', cursor: 'pointer', fontSize: 16 }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={submit}
          disabled={!allRated || submitting}
          style={{ width: '100%', padding: 15, borderRadius: 14, background: allRated ? 'var(--green)' : 'var(--border)', border: 'none', fontWeight: 700, fontSize: 15, color: allRated ? 'white' : 'var(--text3)', cursor: allRated ? 'pointer' : 'default', fontFamily: 'inherit', marginTop: 4 }}
        >
          {submitting ? 'Submitting…' : 'Submit Ratings'}
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: 12, borderRadius: 14, background: 'transparent', border: 'none', fontWeight: 500, fontSize: 14, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>
          Skip
        </button>
      </div>
    </div>
  );
}
