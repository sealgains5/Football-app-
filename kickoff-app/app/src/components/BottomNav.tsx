import { Icon, type IconName } from './Icon';
import type { MainScreen } from '../types/nav';

interface Tab {
  id: MainScreen | 'create';
  icon: IconName;
  label: string;
  isCreate?: boolean;
}

const TABS: Tab[] = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'discover', icon: 'search', label: 'Discover' },
  { id: 'create', icon: 'plus', label: '', isCreate: true },
  { id: 'messages', icon: 'msg', label: 'Messages' },
  { id: 'profile', icon: 'user', label: 'Profile' },
];

interface BottomNavProps {
  active: MainScreen | null;
  onSelect: (screen: MainScreen) => void;
  onCreate: () => void;
}

export function BottomNav({ active, onSelect, onCreate }: BottomNavProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: `calc(20px + var(--safe-bottom))`,
        zIndex: 20,
      }}
    >
      {TABS.map((t) =>
        t.isCreate ? (
          <button
            key="create"
            onClick={onCreate}
            style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px oklch(0.50 0.16 145 / 0.4)',
                marginTop: -24,
              }}
            >
              <Icon name="plus" size={24} color="white" strokeWidth={2.5} />
            </div>
          </button>
        ) : (
          <button
            key={t.id}
            onClick={() => onSelect(t.id as MainScreen)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              paddingTop: 10,
              color: active === t.id ? 'var(--green)' : 'var(--text3)',
              fontFamily: 'inherit',
            }}
          >
            <Icon name={t.icon} size={22} color={active === t.id ? 'var(--green)' : 'var(--text3)'} strokeWidth={active === t.id ? 2.2 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        )
      )}
    </div>
  );
}
