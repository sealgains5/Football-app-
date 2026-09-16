import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { removeFromRoster, setRosterStatus } from '../hooks/useGames';
import type { Game } from '../types/domain';
import type { NavigateFn } from '../types/nav';

interface OrganiserDashboardProps {
  game: Game;
  navigate: NavigateFn;
  onRefresh: () => void;
}

export function OrganiserDashboard({ game, navigate, onRefresh }: OrganiserDashboardProps) {
  const paidPlayers = game.players.filter((p) => p.paid);
  const unpaidCount = game.players.length - paidPlayers.length;
  const collected = paidPlayers.length * game.cost;

  const approve = async (playerId: string) => {
    await setRosterStatus(game.id, playerId, 'joined');
    onRefresh();
  };
  const decline = async (playerId: string) => {
    await removeFromRoster(game.id, playerId);
    onRefresh();
  };

  return (
    <div style={{ height: '100%', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ background: 'var(--bg2)', padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('back')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex' }}>
          <Icon name="back" size={22} />
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Manage Game</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{game.title}</div>
        </div>
      </div>
      <div style={{ padding: '16px 20px 100px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {(
            [
              ['Players', `${game.joinedCount}/${game.spots}`, 'var(--green)'],
              ['Collected', `£${collected}`, 'var(--blue)'],
              ['Pending', `£${unpaidCount * game.cost}`, 'var(--amber)'],
            ] as const
          ).map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Payment Tracker</div>
          {game.players.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 16px', borderBottom: i < game.players.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <Avatar initials={p.initials} size={32} imageUrl={p.avatarUrl} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: p.paid ? 'var(--green)' : 'var(--red)' }}>{p.paid ? `✓ £${game.cost}` : `Pending £${game.cost}`}</div>
            </div>
          ))}
        </div>

        {game.requested.length > 0 && (
          <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Join Requests ({game.requested.length})</div>
            {game.requested.map((r, i) => (
              <div key={r.id} style={{ padding: '12px 16px', borderBottom: i < game.requested.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <Avatar initials={r.initials} size={36} imageUrl={r.avatarUrl} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => approve(r.id)} style={{ flex: 1, padding: 9, borderRadius: 10, background: 'var(--green)', border: 'none', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Approve
                  </button>
                  <button onClick={() => decline(r.id)} style={{ flex: 1, padding: 9, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text2)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {game.waitlist.length > 0 && (
          <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Waitlist ({game.waitlist.length})</div>
            {game.waitlist.map((w, i) => (
              <div key={w.id} style={{ fontSize: 14, color: 'var(--text2)', padding: '6px 0', borderBottom: i < game.waitlist.length - 1 ? '1px solid var(--border)' : 'none' }}>
                {w.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
