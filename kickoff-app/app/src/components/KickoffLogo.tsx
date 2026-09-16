export function KickoffLogo({ size = 80, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="36" r="26" fill={color} opacity={0.15} />
      <circle cx="40" cy="36" r="22" stroke={color} strokeWidth="2.5" fill="none" />
      <polygon points="40,20 46,26 44,34 36,34 34,26" fill={color} opacity={0.9} />
      <polygon points="22,30 28,26 34,30 32,38 24,38" fill={color} opacity={0.55} />
      <polygon points="58,30 56,38 48,38 46,30 52,26" fill={color} opacity={0.55} />
      <polygon points="26,46 32,42 36,46 34,54 28,54" fill={color} opacity={0.4} />
      <polygon points="54,46 52,54 46,54 44,46 48,42" fill={color} opacity={0.4} />
      <path d="M28 64 Q40 58 52 64" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity={0.7} />
    </svg>
  );
}
