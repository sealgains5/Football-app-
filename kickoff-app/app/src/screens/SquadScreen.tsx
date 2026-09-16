import { useEffect, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Tag } from '../components/Tag';
import { useSquads } from '../hooks/useSquads';
import { fetchProfile } from '../hooks/usePlayers';
import type { Profile } from '../types/domain';
import type { NavigateFn } from '../types/nav';

interface SquadScreenProps {
  navigate: NavigateFn;
  following: Set<string>;
  ownerId?: string;
}

export function SquadScreen({ navigate, following, ownerId }: SquadScreenProps) {
  const { groups, createSquad } = useSquads(ownerId);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [followedPlayers, setFollowedPlayers] = useState<Profile[]>([]);

  useEffect(() => {
    Promise.all([...following].map((id) => fetchProfile(id))).then((list) => setFollowedPlayers(list.filter((p): p is Profile => p !== null)));
  }, [following]);

  const handleCreate = async () => {
    await createSquad(newName);
    setNewName('');
    setCreating(false);
  };

  return (
    <div style={{ height: '100%', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ padding: '16px 20px 12px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('back')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', padding: 0 }}>
            <Icon name="back" size={22} />
          </button>
          <div style={{ fontWeight: 700, fontSize: 20 }}>My Squad</div>
        </div>
        <button onClick={() => setCreating(true)} style={{ background: 'var(--green)', border: 'none', borderRadius: 10, padding: '8px 14px', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          + New Group
        </button>
      </div>
      {creating && (
        <div style={{ padding: '14px 20px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Group name…"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: 'var(--bg)' }}
          />
          <button onClick={handleCreate} style={{ padding: '10px 16px', borderRadius: 12, background: 'var(--green)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Create
          </button>
        </div>
      )}
      <div style={{ padding: '14px 20px 14px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Groups</div>
        {groups.length === 0 && <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>No groups yet — create one above</div>}
        {groups.map((g) => (
          <div key={g.id} style={{ background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{g.name}</div>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{g.games} games</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {g.members.slice(0, 6).map((m) => (
                <Avatar key={m.id} initials={m.initials} size={32} />
              ))}
              {g.members.length > 6 && <span style={{ fontSize: 12, color: 'var(--text3)' }}>+{g.members.length - 6}</span>}
              {g.members.length === 0 && <span style={{ fontSize: 12, color: 'var(--text3)' }}>No members yet</span>}
            </div>
            <button style={{ marginTop: 10, padding: '8px 14px', borderRadius: 10, background: 'var(--green)', border: 'none', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Invite to Game</button>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 20px 100px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Players I Follow ({followedPlayers.length})</div>
        {followedPlayers.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>Follow players to add them here</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {followedPlayers.map((p) => (
              <div key={p.id} style={{ background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <Avatar initials={p.initials} size={40} imageUrl={p.avatarUrl} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{p.positions.join(' · ') || 'No position set'}</div>
                </div>
                {p.skillRating != null && <Tag label={`★ ${p.skillRating.toFixed(1)}`} variant="green" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
