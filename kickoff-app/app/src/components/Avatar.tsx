import type { CSSProperties } from 'react';

const PALETTE = ['#1a7c3e', '#2a5298', '#8b1a1a', '#6b2fa0', '#b8621a', '#1a6e8c', '#2c7a2c', '#8c3a7a', '#5a4e2a', '#3a6b8c', '#8c5a1a', '#2a6b4e'];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface AvatarProps {
  initials: string;
  size?: number;
  imageUrl?: string | null;
  style?: CSSProperties;
}

export function Avatar({ initials, size = 36, imageUrl, style = {} }: AvatarProps) {
  const base: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: size * 0.38,
    fontWeight: 600,
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  };

  if (imageUrl) {
    return (
      <div style={base}>
        <img src={imageUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return <div style={{ ...base, background: colorFor(initials) }}>{initials}</div>;
}
