import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import type { Profile } from '../types/domain';
import type { NavigateFn } from '../types/nav';

interface PlayerPublicProfileProps {
  player: Profile;
  isFollowing: boolean;
  onToggleFollow: (id: string, name: string) => void;
  navigate: NavigateFn;
}

export function PlayerPublicProfile({ player, isFollowing, onToggleFollow, navigate }: PlayerPublicProfileProps) {
  return (
    <div style={{ height: '100%', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ background: '#0a0a0a', padding: '20px 20px 50px' }}>
        <button onClick={() => navigate('back')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', marginBottom: 16 }}>
          <Icon name="back" size={22} color="white" />
        </button>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Avatar initials={player.initials} size={68} imageUrl={player.avatarUrl} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{player.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {player.positions.join(' · ') || 'No position set'} · {player.location || 'Location unknown'}
            </div>
          </div>
        </div>
      </div>
      <div style={{ margin: '-28px 20px 16px', background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[['Followers', player.followers], ['Following', player.following], ['Games', player.gamesPlayed]].map(([l, v], i) => (
            <div key={l as string} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 10 }}>
          <button
            onClick={() => onToggleFollow(player.id, player.name)}
            style={{ flex: 1, padding: 12, borderRadius: 12, border: isFollowing ? '1.5px solid var(--border)' : 'none', background: isFollowing ? 'transparent' : 'var(--green)', color: isFollowing ? 'var(--text2)' : 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button style={{ flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text)' }}>Message</button>
        </div>
      </div>
      <div style={{ padding: '0 20px 16px' }}>
        {player.bio && <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>{player.bio}</div>}
        {player.skillRating != null && (
          <div style={{ background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'center', minWidth: 50 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{player.skillRating.toFixed(1)}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>/ 5.0</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Skill Rating</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Based on {player.gamesPlayed} games</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
