import type { RosterPlayer } from '../types/domain';

export function PitchPlayer({ player }: { player: RosterPlayer }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: 'white',
        }}
      >
        {player.initials}
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 500, textAlign: 'center', maxWidth: 40, lineHeight: 1.1 }}>
        {player.name.split(' ')[0]}
      </div>
    </div>
  );
}
