import { useRef, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { PitchPlayer } from '../components/PitchPlayer';
import { Tag } from '../components/Tag';
import { useMessages } from '../hooks/useMessages';
import { formatDate, type Game, type RosterPlayer } from '../types/domain';
import type { NavigateFn } from '../types/nav';

type Tab = 'info' | 'lineup' | 'chat';
type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'LW' | 'RW' | 'ST';
const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CM', 'LW', 'RW', 'ST'];

interface GameDetailScreenProps {
  game: Game;
  navigate: NavigateFn;
  joinedGameIds: string[];
  onJoin: (waitlist: boolean) => void;
  isOrganiser: boolean;
  myId?: string;
}

export function GameDetailScreen({ game, navigate, joinedGameIds, onJoin, isOrganiser, myId }: GameDetailScreenProps) {
  const [tab, setTab] = useState<Tab>('info');
  const [msg, setMsg] = useState('');
  const { messages, sendMessage } = useMessages(game.id, myId);
  const chatRef = useRef<HTMLDivElement>(null);
  const isJoined = joinedGameIds.includes(game.id);
  const isFull = game.joinedCount >= game.spots;
  const isPast = new Date(`${game.date}T00:00:00`) < new Date(new Date().toDateString());

  const send = () => {
    if (!msg.trim()) return;
    sendMessage(msg);
    setMsg('');
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  };

  const positions: Record<Position, RosterPlayer[]> = { GK: [], CB: [], LB: [], RB: [], CM: [], LW: [], RW: [], ST: [] };
  game.players.forEach((p) => {
    const pos = (p.position ?? 'CM') as Position;
    (POSITIONS.includes(pos) ? positions[pos] : positions.CM).push(p);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '14px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={() => navigate('back')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text)', display: 'flex' }}>
            <Icon name="back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{game.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              {formatDate(game.date)} · {game.time}
            </div>
          </div>
          {game.isPrivate && <Icon name="lock" size={16} color="var(--text3)" />}
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['info', 'lineup', 'chat'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? '2.5px solid var(--green)' : '2.5px solid transparent',
                color: tab === t ? 'var(--green)' : 'var(--text2)',
                fontWeight: tab === t ? 700 : 400,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}
            >
              {t === 'chat' ? `Chat ${messages.length > 0 ? `(${messages.length})` : ''}` : t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {tab === 'info' && (
          <div style={{ padding: '16px 20px 100px' }}>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 14 }}>
              {(
                [
                  ['pin', 'Location', `${game.location} · ${game.pitch}`],
                  ['clock', 'Date & Time', `${formatDate(game.date)} · ${game.time}`],
                  ['users', 'Players', `${game.joinedCount} / ${game.spots} joined${game.waitlist.length > 0 ? ` · ${game.waitlist.length} on waitlist` : ''}`],
                  ['star', 'Skill level', game.skill],
                  ['card', 'Cost', `£${game.cost} per player`],
                ] as const
              ).map(([icon, label, val], i, arr) => (
                <div key={label} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={icon} size={16} color="var(--green)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 16px', marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar initials={game.organiserInitials} size={44} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Organised by</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{game.organiserName}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {game.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
              <Tag label={`#${game.format.replace('-a-side', 'v')}`} variant="green" />
            </div>
            {game.waitlist.length > 0 && (
              <div style={{ background: 'oklch(0.97 0.04 60)', borderRadius: 14, padding: '12px 16px', border: '1px solid oklch(0.91 0.06 60)', marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'oklch(0.50 0.14 60)', marginBottom: 4 }}>Waitlist ({game.waitlist.length})</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{game.waitlist.map((w) => w.name).join(', ')}</div>
              </div>
            )}
            {isJoined && isPast && (
              <button
                onClick={() => navigate('rate', game.id)}
                style={{ width: '100%', padding: 14, borderRadius: 14, background: 'var(--bg2)', border: '1.5px solid var(--border)', fontWeight: 600, fontSize: 14, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Icon name="star" size={16} color="var(--amber)" /> Rate your teammates
              </button>
            )}
          </div>
        )}

        {tab === 'lineup' && (
          <div style={{ padding: '16px 20px 100px' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 14 }}>
              <div style={{ background: 'linear-gradient(180deg, oklch(0.42 0.18 145) 0%, oklch(0.38 0.15 145) 100%)', padding: '20px 16px', position: 'relative' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 300 220" preserveAspectRatio="none">
                  <rect x="10" y="10" width="280" height="200" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="10" y1="110" x2="290" y2="110" stroke="white" strokeWidth="1.5" />
                  <circle cx="150" cy="110" r="30" fill="none" stroke="white" strokeWidth="1.5" />
                  <circle cx="150" cy="110" r="2" fill="white" />
                  <rect x="90" y="10" width="120" height="40" fill="none" stroke="white" strokeWidth="1.5" />
                  <rect x="90" y="170" width="120" height="40" fill="none" stroke="white" strokeWidth="1.5" />
                  <rect x="115" y="10" width="70" height="20" fill="none" stroke="white" strokeWidth="1.5" />
                  <rect x="115" y="190" width="70" height="20" fill="none" stroke="white" strokeWidth="1.5" />
                </svg>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {positions.GK.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                      {positions.GK.map((p) => (
                        <PitchPlayer key={p.id} player={p} />
                      ))}
                    </div>
                  )}
                  {[...positions.CB, ...positions.LB, ...positions.RB].length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
                      {[...positions.CB, ...positions.LB, ...positions.RB].map((p) => (
                        <PitchPlayer key={p.id} player={p} />
                      ))}
                    </div>
                  )}
                  {positions.CM.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
                      {positions.CM.slice(0, 4).map((p) => (
                        <PitchPlayer key={p.id} player={p} />
                      ))}
                    </div>
                  )}
                  {[...positions.LW, ...positions.ST, ...positions.RW].length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                      {[...positions.LW, ...positions.ST, ...positions.RW].map((p) => (
                        <PitchPlayer key={p.id} player={p} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {game.players.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', borderBottom: i < game.players.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <Avatar initials={p.initials} size={36} imageUrl={p.avatarUrl} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{p.name}</div>
                  </div>
                  <Tag label={p.position || 'CM'} variant={p.position === 'GK' ? 'amber' : p.position === 'ST' ? 'red' : 'default'} />
                </div>
              ))}
              {Array.from({ length: Math.max(0, game.spots - game.players.length) }).map((_, i) => (
                <div key={`empty-${i}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', borderBottom: i < game.spots - game.players.length - 1 ? '1px solid var(--border)' : 'none', opacity: 0.4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="plus" size={14} color="var(--text3)" />
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text3)' }}>Open spot</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!isJoined && (
              <div style={{ background: 'oklch(0.96 0.04 75)', padding: '12px 20px', fontSize: 13, color: 'oklch(0.50 0.14 60)', fontWeight: 500 }}>Join the game to participate in chat</div>
            )}
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m) => (
                <div key={m.id} style={{ display: 'flex', gap: 8, flexDirection: m.mine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  {!m.mine && <Avatar initials={m.avatar} size={28} />}
                  <div style={{ maxWidth: '72%' }}>
                    {!m.mine && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3, marginLeft: 4 }}>{m.from}</div>}
                    <div
                      style={{
                        background: m.mine ? 'var(--green)' : 'var(--bg2)',
                        color: m.mine ? '#fff' : 'var(--text)',
                        borderRadius: m.mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 14px',
                        fontSize: 14,
                        border: m.mine ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {m.text}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, textAlign: m.mine ? 'right' : 'left', marginLeft: 4, marginRight: 4 }}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            {isJoined && (
              <div style={{ padding: '10px 16px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--bg2)' }}>
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Message…"
                  style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 24, padding: '10px 16px', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--text)' }}
                />
                <button onClick={send} style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--green)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="send" size={17} color="white" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {tab !== 'chat' && (
        <div style={{ padding: '12px 20px 20px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {isJoined ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, background: 'var(--green-light)', borderRadius: 14, padding: '15px', textAlign: 'center', fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>✓ You're in!</div>
              {isOrganiser && (
                <button onClick={() => navigate('organiserDashboard', game.id)} style={{ padding: '0 16px', background: 'var(--green)', border: 'none', borderRadius: 14, color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Manage
                </button>
              )}
              <button onClick={() => navigate('chat')} style={{ width: 52, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="msg" size={20} color="var(--text2)" />
              </button>
            </div>
          ) : isFull ? (
            <button
              onClick={() => onJoin(true)}
              style={{ width: '100%', padding: '15px', borderRadius: 14, background: 'var(--amber)', border: 'none', fontWeight: 700, fontSize: 15, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Join Waitlist
            </button>
          ) : (
            <button
              onClick={() => navigate('payment', game.id)}
              style={{ width: '100%', padding: '15px', borderRadius: 14, background: 'var(--green)', border: 'none', fontWeight: 700, fontSize: 16, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Join for £{game.cost}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
