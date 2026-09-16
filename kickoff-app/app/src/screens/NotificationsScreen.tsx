import { Avatar } from '../components/Avatar';
import { Icon, type IconName } from '../components/Icon';
import { removeFromRoster, setRosterStatus } from '../hooks/useGames';
import type { NotificationType } from '../types/database';
import type { AppNotification } from '../types/domain';
import type { NavigateFn } from '../types/nav';

const NOTIF_ICON: Record<NotificationType, IconName> = { join: 'users', payment: 'card', reminder: 'clock', rating: 'star', follow: 'user', request: 'users' };
const NOTIF_COLOR: Record<NotificationType, string> = { join: 'var(--green)', payment: 'var(--blue)', reminder: 'var(--amber)', rating: '#f59e0b', follow: 'var(--blue)', request: 'var(--amber)' };

interface NotificationsScreenProps {
  navigate: NavigateFn;
  notifications: AppNotification[];
  onMarkRead: () => void;
  onRefresh: () => void;
}

export function NotificationsScreen({ navigate, notifications, onMarkRead, onRefresh }: NotificationsScreenProps) {
  const approve = async (n: AppNotification) => {
    if (!n.relatedGameId || !n.relatedUserId) return;
    await setRosterStatus(n.relatedGameId, n.relatedUserId, 'joined');
    onRefresh();
  };
  const decline = async (n: AppNotification) => {
    if (!n.relatedGameId || !n.relatedUserId) return;
    await removeFromRoster(n.relatedGameId, n.relatedUserId);
    onRefresh();
  };

  return (
    <div style={{ height: '100%', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ padding: '16px 20px 12px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('back')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', padding: 0 }}>
            <Icon name="back" size={22} />
          </button>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Notifications</div>
        </div>
        <button onClick={onMarkRead} style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Mark all read
        </button>
      </div>
      <div style={{ paddingBottom: 100 }}>
        {notifications.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)', fontSize: 14 }}>Nothing yet — you're all caught up</div>}
        {notifications.map((n) => (
          <div key={n.id} style={{ display: 'flex', gap: 12, padding: '14px 20px', background: n.read ? 'transparent' : 'oklch(0.96 0.04 145)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: NOTIF_COLOR[n.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {n.avatar ? <Avatar initials={n.avatar} size={44} style={{ borderRadius: 12 }} /> : <Icon name={NOTIF_ICON[n.type]} size={20} color={NOTIF_COLOR[n.type]} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.4, fontWeight: n.read ? 400 : 600 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{n.time}</div>
              {n.type === 'request' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => approve(n)} style={{ padding: '6px 16px', borderRadius: 8, background: 'var(--green)', border: 'none', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Approve
                  </button>
                  <button onClick={() => decline(n)} style={{ padding: '6px 16px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text2)', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Decline
                  </button>
                </div>
              )}
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
