type TagVariant = 'default' | 'green' | 'red' | 'amber' | 'blue';

const STYLES: Record<TagVariant, { bg: string; color: string; border: string }> = {
  default: { bg: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--border)' },
  green: { bg: 'var(--green-light)', color: 'var(--green)', border: 'none' },
  red: { bg: 'oklch(0.96 0.04 25)', color: 'var(--red)', border: 'none' },
  amber: { bg: 'oklch(0.97 0.05 75)', color: 'oklch(0.55 0.15 60)', border: 'none' },
  blue: { bg: 'oklch(0.94 0.05 240)', color: 'var(--blue)', border: 'none' },
};

export function Tag({ label, variant = 'default' }: { label: string; variant?: TagVariant }) {
  const s = STYLES[variant];
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        background: s.bg,
        color: s.color,
        border: s.border,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
