import { Avatar } from './Avatar';
import type { Profile } from '../types/domain';

interface PlayerCardProps {
  player: Profile;
  isFollowing: boolean;
  onToggleFollow: (id: string, name: string) => void;
  onPress: () => void;
}

export function PlayerCard({ player, isFollowing, onToggleFollow, onPress }: PlayerCardProps) {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        borderRadius: 'var(--card-radius, 16px)',
        border: '1px solid var(--border)',
        padding: '14px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div onClick={onPress} style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, cursor: 'pointer', minWidth: 0 }}>
        <Avatar initials={player.initials} size={48} imageUrl={player.avatarUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{player.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>
            {player.positions.join(' · ') || 'No position set'} · {player.location || 'Location unknown'}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{player.gamesPlayed} games</span>
            {player.skillRating != null && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>★ {player.skillRating.toFixed(1)}</span>}
          </div>
        </div>
      </div>
      <button
        onClick={() => onToggleFollow(player.id, player.name)}
        style={{
          padding: '8px 16px',
          borderRadius: 20,
          border: isFollowing ? '1.5px solid var(--border)' : 'none',
          background: isFollowing ? 'transparent' : 'var(--green)',
          color: isFollowing ? 'var(--text2)' : 'white',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'inherit',
          flexShrink: 0,
        }}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
