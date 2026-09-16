import { Avatar } from '../components/Avatar';
import { GameCard } from '../components/GameCard';
import { Icon } from '../components/Icon';
import { useReceivedRating } from '../hooks/useStats';
import type { Game } from '../types/domain';
import type { NavigateFn } from '../types/nav';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Still up 🌙';
  if (h < 12) return 'Good morning ☀️';
  if (h < 18) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

interface HomeScreenProps {
  navigate: NavigateFn;
  games: Game[];
  joinedGameIds: string[];
  myName: string;
  myInitials: string;
  gamesPlayed: number;
  notifCount: number;
  userId?: string;
}

export function HomeScreen({ navigate, games, joinedGameIds, myName, myInitials, gamesPlayed, notifCount, userId }: HomeScreenProps) {
  const { avgRating } = useReceivedRating(userId);
  const upcoming = games.filter((g) => joinedGameIds.includes(g.id));
  const suggested = games.filter((g) => !joinedGameIds.includes(g.id)).slice(0, 2);

  return (
    <div style={{ overflowY: 'auto', height: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '16px 20px 12px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 400 }}>{greeting()}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{myName}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => navigate('notifications')}
              style={{ position: 'relative', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Icon name="clock" size={20} color="var(--text2)" />
              {notifCount > 0 && <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />}
            </button>
            <Avatar initials={myInitials} size={42} />
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 20px', display: 'flex', gap: 10 }}>
        {[
          [String(gamesPlayed), 'Games played'],
          [avgRating != null ? `${avgRating}★` : '—', 'Rating'],
          [String(upcoming.length), 'Upcoming'],
        ].map(([v, l]) => (
          <div key={l} style={{ flex: 1, background: 'var(--bg2)', borderRadius: 14, padding: '12px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>My upcoming games</div>
        {upcoming.length === 0 ? (
          <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: '24px 20px', textAlign: 'center', color: 'var(--text2)', fontSize: 14 }}>
            No upcoming games. Discover or create one below!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map((g) => (
              <GameCard key={g.id} game={g} joined onPress={() => navigate('gameDetail', g.id)} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '12px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Nearby games</div>
          <button onClick={() => navigate('discover')} style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            See all
          </button>
        </div>
        {suggested.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 14, padding: '20px 0' }}>No games nearby yet — be the first to create one!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {suggested.map((g) => (
              <GameCard key={g.id} game={g} onPress={() => navigate('gameDetail', g.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
