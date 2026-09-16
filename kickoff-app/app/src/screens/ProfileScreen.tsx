import { useEffect, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { useAuth } from '../hooks/useAuth';
import { fetchLatestAssessment, type SkillAnswers, type SkillKey } from '../hooks/useSkillAssessment';
import { confidencePct } from '../hooks/useSkillAssessment';
import { formatDate, initialsOf, type Game } from '../types/domain';
import type { NavigateFn } from '../types/nav';

const ALL_POSITIONS = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'AM'];
const SKILL_LABELS: Record<SkillKey, string> = { pace: 'Pace', shooting: 'Shooting', passing: 'Passing', dribbling: 'Dribbling', defending: 'Defending', fitness: 'Fitness', experience: 'Experience', iq: 'Game IQ' };
const SKILL_COLORS: Record<SkillKey, string> = { pace: '#e07b30', shooting: '#cc3333', passing: '#2a7acc', dribbling: '#8b44cc', defending: '#1a8c4e', fitness: '#cc8800', experience: '#555', iq: '#2a8c8c' };

interface ProfileScreenProps {
  navigate: NavigateFn;
  games: Game[];
  joinedGameIds: string[];
  followers: number;
  following: number;
}

export function ProfileScreen({ navigate, games, joinedGameIds, followers, following }: ProfileScreenProps) {
  const { profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editPositions, setEditPositions] = useState<string[]>(profile?.positions || []);
  const [breakdown, setBreakdown] = useState<SkillAnswers | null>(null);

  useEffect(() => {
    if (profile) fetchLatestAssessment(profile.id).then(setBreakdown);
  }, [profile]);

  if (!profile) return null;

  const name = profile.full_name || 'Player';
  const initials = initialsOf(name);
  const gamesPlayed = joinedGameIds.length;
  const reliability = confidencePct(gamesPlayed);
  const reliabilityColor = reliability < 50 ? 'var(--red)' : reliability < 72 ? 'var(--amber)' : 'var(--green)';
  const myGames = games.filter((g) => joinedGameIds.includes(g.id));

  const teammateMap: Record<string, { name: string; initials: string; count: number }> = {};
  myGames.forEach((g) => {
    g.players.forEach((p) => {
      if (p.id === profile.id) return;
      if (!teammateMap[p.id]) teammateMap[p.id] = { name: p.name, initials: p.initials, count: 0 };
      teammateMap[p.id].count++;
    });
  });
  const teammates = Object.values(teammateMap).sort((a, b) => b.count - a.count).slice(0, 8);

  const saveEdit = async () => {
    await updateProfile({ full_name: editName, positions: editPositions });
    setEditing(false);
  };

  return (
    <div style={{ height: '100%', background: 'var(--bg)', overflowY: 'auto', position: 'relative' }}>
      {editing && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg2)', borderRadius: '24px 24px 0 0', width: '100%', padding: '20px 20px 36px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Edit Profile</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <Avatar initials={initials} size={72} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg2)' }}>
                  <Icon name="plus" size={12} color="white" strokeWidth={3} />
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Full name</div>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', fontFamily: 'DM Sans,sans-serif', background: 'var(--bg)', color: 'var(--text)', marginBottom: 16 }}
            />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Preferred positions</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {ALL_POSITIONS.map((p) => {
                const sel = editPositions.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => setEditPositions((ps) => (sel ? ps.filter((x) => x !== p) : [...ps, p]))}
                    style={{ padding: '8px 14px', borderRadius: 10, border: sel ? 'none' : '1.5px solid var(--border)', background: sel ? 'var(--green)' : 'var(--bg2)', color: sel ? 'white' : 'var(--text2)', fontWeight: sel ? 700 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button onClick={saveEdit} style={{ width: '100%', padding: 15, borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} style={{ width: '100%', padding: 11, borderRadius: 14, background: 'transparent', border: 'none', fontWeight: 500, fontSize: 14, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 6 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#0a0a0a', padding: '20px 20px 56px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={() => {
                setEditName(name);
                setEditPositions(profile.positions);
                setEditing(true);
              }}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 10, padding: '7px 14px', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Edit Profile
            </button>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'white', border: '3px solid rgba(255,255,255,0.5)', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{profile.location || 'Add your location'}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: '-32px 20px 16px', background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[[followers, 'Followers'], [following, 'Following'], [gamesPlayed, 'Games']].map(([v, l], i) => (
            <div key={l as string} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{l}</div>
            </div>
          ))}
        </div>
        {profile.skill_rating != null ? (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{profile.skill_rating.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>out of 5.0</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Confidence</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: reliabilityColor }}>{reliability}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${reliability}%`, background: reliabilityColor, borderRadius: 6 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                {reliability < 60 ? `Play ${Math.ceil((60 - reliability) / 3)} more games to boost` : reliability < 80 ? 'Good confidence — keep playing!' : 'High confidence ✓'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('assessment')}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="star" size={18} color="var(--green)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Get your Skill Rating</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Takes 2 minutes</div>
            </div>
            <Icon name="chevron" size={16} color="var(--text3)" />
          </div>
        )}
        <div style={{ padding: '10px 0', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--green)' }}>{(profile.positions.length ? profile.positions : ['—']).slice(0, 3).join(' · ')}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>Preferred positions</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 14px' }}>
        <button onClick={() => navigate('squad')} style={{ width: '100%', padding: '13px 16px', borderRadius: 14, background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="users" size={18} color="var(--green)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>My Squad</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{following} players followed</div>
          </div>
          <Icon name="chevron" size={16} color="var(--text3)" />
        </button>
      </div>

      {breakdown && (
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Skill Breakdown</div>
          <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 16px' }}>
            {(Object.entries(breakdown) as [SkillKey, number][]).map(([key, val]) => (
              <div key={key} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{SKILL_LABELS[key]}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: SKILL_COLORS[key] }}>{val.toFixed(1)}</span>
                </div>
                <div style={{ height: 5, borderRadius: 5, background: 'var(--bg)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(val / 5) * 100}%`, background: SKILL_COLORS[key], borderRadius: 5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teammates.length > 0 && (
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Past teammates</div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {teammates.map((p) => (
              <div key={p.initials} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <Avatar initials={p.initials} size={44} />
                <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', maxWidth: 44 }}>{p.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{p.count}×</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '0 20px 100px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Game history</div>
        {myGames.length === 0 ? (
          <div style={{ background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: 20, textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>No games yet — join one to build your history!</div>
        ) : (
          myGames.map((g) => (
            <div key={g.id} onClick={() => navigate('gameDetail', g.id)} style={{ background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: '12px 14px', marginBottom: 10, cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>⚽</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {formatDate(g.date)} · {g.format}
                  </div>
                </div>
                <Icon name="chevron" size={16} color="var(--text3)" />
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {g.players.filter((p) => p.id !== profile.id).slice(0, 6).map((p) => (
                  <Avatar key={p.id} initials={p.initials} size={22} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>with {g.players.filter((p) => p.id !== profile.id).length} teammates</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
