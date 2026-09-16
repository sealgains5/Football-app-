export type IconName =
  | 'home'
  | 'search'
  | 'plus'
  | 'msg'
  | 'user'
  | 'pin'
  | 'clock'
  | 'users'
  | 'lock'
  | 'star'
  | 'back'
  | 'check'
  | 'fire'
  | 'close'
  | 'send'
  | 'card'
  | 'chevron'
  | 'filter'
  | 'football'
  | 'share';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  msg: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </>
  ),
  star: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />,
  back: <path d="M19 12H5M12 5l-7 7 7 7" />,
  check: <path d="M20 6L9 17l-5-5" />,
  fire: (
    <>
      <path d="M12 2c0 0-5.5 4-5.5 9.5A5.5 5.5 0 0012 17a5.5 5.5 0 005.5-5.5C17.5 6 12 2 12 2z" />
      <path d="M12 17c-1.1 0-2-.9-2-2 0-1.8 2-4 2-4s2 2.2 2 4c0 1.1-.9 2-2 2z" />
    </>
  ),
  close: <path d="M18 6L6 18M6 6l12 12" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  card: (
    <>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
    </>
  ),
  chevron: <path d="M9 18l6-6-6-6" />,
  filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  football: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2c0 0-2 3-2 6s2 5 2 5 2-2 2-5-2-6-2-6z" opacity={0.3} />
      <path d="M2 12h20M6.34 5.34l11.32 11.32M17.66 5.34L6.34 16.66" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </>
  ),
};

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}
