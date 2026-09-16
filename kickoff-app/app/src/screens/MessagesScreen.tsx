import { useLastMessages } from '../hooks/useMessages';
import type { Game } from '../types/domain';
import type { NavigateFn } from '../types/nav';

interface MessagesScreenProps {
  navigate: NavigateFn;
  games: Game[];
  joinedGameIds: string[];
  myId?: string;
}

export function MessagesScreen({ navigate, games, joinedGameIds, myId }: MessagesScreenProps) {
  const myGames = games.filter((g) => joinedGameIds.includes(g.id));
  const lastByGame = useLastMessages(myGames.map((g) => g.id), myId);

  return (
    <div style={{ height: '100%', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ padding: '16px 20px 12px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>Messages</div>
      </div>
      <div style={{ padding: '8px 0 100px' }}>
        {myGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)', fontSize: 14 }}>Join a game to see its chat here</div>
        ) : (
          myGames.map((g) => {
            const lm = lastByGame[g.id];
            return (
              <div
                key={g.id}
                onClick={() => navigate('gameDetail', g.id)}
                style={{ display: 'flex', gap: 14, padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 20 }}>⚽</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{g.title}</div>
                    {lm && <div style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{lm.time}</div>}
                  </div>
                  {lm ? (
                    <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lm.mine ? 'You: ' : `${lm.from.split(' ')[0]}: `}
                      {lm.text}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>No messages yet</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
