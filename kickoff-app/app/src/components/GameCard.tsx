import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Tag } from './Tag';
import { formatDate, type Game } from '../types/domain';

interface GameCardProps {
  game: Game;
  onPress: () => void;
  joined?: boolean;
  showPrice?: boolean;
}

export function GameCard({ game, onPress, joined = false, showPrice = true }: GameCardProps) {
  const spotsLeft = game.spots - game.joinedCount;
  const pct = (game.joinedCount / game.spots) * 100;
  const formatColor = game.format === '5-a-side' ? 'green' : game.format === '7-a-side' ? 'blue' : 'amber';

  return (
    <div
      onClick={onPress}
      style={{
        background: 'var(--bg2)',
        borderRadius: 'var(--card-radius, 16px)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ height: 5, background: game.isPrivate ? 'var(--text2)' : 'var(--green)' }} />
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <Tag label={game.format} variant={formatColor} />
              {game.isPrivate && <Tag label="Private" variant="red" />}
              {joined && <Tag label="Joined" variant="green" />}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', lineHeight: 1.2 }}>{game.title}</div>
          </div>
          {showPrice && (
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>£{game.cost}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>per player</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: 'var(--text2)', fontSize: 13 }}>
            <Icon name="clock" size={13} color="var(--text3)" />
            {formatDate(game.date)} · {game.time}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: 'var(--text2)', fontSize: 13, marginBottom: 14 }}>
          <Icon name="pin" size={13} color="var(--text3)" />
          {game.location}
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>
              {game.joinedCount} / {game.spots} players
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: spotsLeft <= 2 ? 'var(--red)' : spotsLeft <= 4 ? 'var(--amber)' : 'var(--text2)' }}>
              {spotsLeft <= 0 ? 'Full' : `${spotsLeft} spots left`}
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 10, background: 'var(--bg)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(pct, 100)}%`,
                background: pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--green)',
                borderRadius: 10,
                transition: 'width 0.4s',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar initials={game.organiserInitials} size={22} />
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>by {game.organiserName}</span>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <Tag label={game.skill} />
            <Tag label={game.pitch} />
          </div>
        </div>
      </div>
    </div>
  );
}
