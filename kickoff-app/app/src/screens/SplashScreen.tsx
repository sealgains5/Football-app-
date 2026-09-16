import { useEffect, useState } from 'react';
import { KickoffLogo } from '../components/KickoffLogo';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('out'), 2200);
    const t3 = setTimeout(() => onDone(), 2900);
    return () => [t1, t2, t3].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoOpacity = phase === 'in' ? 0 : 1;
  const logoScale = phase === 'in' ? 0.7 : phase === 'out' ? 1.1 : 1;
  const screenOpacity = phase === 'out' ? 0 : 1;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: screenOpacity,
        transition: phase === 'out' ? 'opacity 0.6s ease-in' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          transition:
            phase === 'in'
              ? 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)'
              : phase === 'out'
                ? 'transform 0.7s ease-in'
                : 'none',
        }}
      >
        <KickoffLogo size={88} color="white" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, fontWeight: 800, color: 'white', letterSpacing: -1.5, lineHeight: 1 }}>Kickoff</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6, letterSpacing: 1.5, fontWeight: 400, textTransform: 'uppercase' }}>
            Your Game, Your Squad
          </div>
        </div>
      </div>
    </div>
  );
}
