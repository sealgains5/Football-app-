import { useEffect, useState } from 'react';
import { GameCard } from '../components/GameCard';
import { Icon } from '../components/Icon';
import { PlayerCard } from '../components/PlayerCard';
import { usePlayerSearch } from '../hooks/usePlayers';
import type { Game } from '../types/domain';
import type { NavigateFn } from '../types/nav';

type Tab = 'games' | 'players';
const FORMATS = ['All', '5-a-side', '7-a-side', '11-a-side'] as const;

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface DiscoverScreenProps {
  navigate: NavigateFn;
  games: Game[];
  joinedGameIds: string[];
  following: Set<string>;
  onToggleFollow: (id: string, name: string) => void;
  myId?: string;
}

export function DiscoverScreen({ navigate, games, joinedGameIds, following, onToggleFollow, myId }: DiscoverScreenProps) {
  const [tab, setTab] = useState<Tab>('games');
  const [filter, setFilter] = useState<(typeof FORMATS)[number]>('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const { players } = usePlayerSearch(tab === 'players' ? debouncedSearch : '', myId);

  const filteredGames = games.filter((g) => {
    const matchFormat = filter === 'All' || g.format === filter;
    const s = search.toLowerCase();
    const matchSearch = s === '' || g.title.toLowerCase().includes(s) || g.location.toLowerCase().includes(s);
    return matchFormat && matchSearch;
  });

  return (
    <div style={{ overflowY: 'auto', height: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '16px 20px 0', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 12 }}>Discover</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', borderRadius: 12, padding: '10px 14px', border: '1px solid var(--border)', marginBottom: 12 }}>
          <Icon name="search" size={16} color="var(--text3)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'games' ? 'Search games…' : 'Search players…'}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, flex: 1, color: 'var(--text)', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex' }}>
          {(['games', 'players'] as Tab[]).map((t) => (
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
              {t}
            </button>
          ))}
        </div>
        {tab === 'games' && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, paddingTop: 10 }}>
            {FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  border: 'none',
                  background: filter === f ? 'var(--green)' : 'var(--bg)',
                  color: filter === f ? '#fff' : 'var(--text2)',
                  fontWeight: filter === f ? 600 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
        {tab === 'players' && <div style={{ height: 10 }} />}
      </div>
      <div style={{ padding: '14px 20px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tab === 'games' &&
          (filteredGames.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 14, padding: '40px 0' }}>No games found</div>
          ) : (
            filteredGames.map((g) => <GameCard key={g.id} game={g} joined={joinedGameIds.includes(g.id)} onPress={() => navigate('gameDetail', g.id)} />)
          ))}
        {tab === 'players' &&
          (players.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 14, padding: '40px 0' }}>No players found</div>
          ) : (
            players.map((p) => (
              <PlayerCard key={p.id} player={p} isFollowing={following.has(p.id)} onToggleFollow={onToggleFollow} onPress={() => navigate('playerProfile', p.id)} />
            ))
          ))}
      </div>
    </div>
  );
}
