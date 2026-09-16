import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

interface SwipeBackProps {
  enabled: boolean;
  onBack: () => void;
  children: ReactNode;
}

export function SwipeBack({ enabled, onBack, children }: SwipeBackProps) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);

  const end = () => {
    if (startX.current === null) return;
    startX.current = null;
    setDragging(false);
    if (dx > 80) {
      setDx(0);
      onBack();
    } else {
      setDx(0);
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const left = e.currentTarget.getBoundingClientRect().left;
    if (e.clientX - left < 44) {
      startX.current = e.clientX;
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // pointer capture is best-effort
      }
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    setDx(Math.max(0, Math.min(e.clientX - startX.current, 300)));
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      style={{
        height: '100%',
        transform: `translateX(${dx}px)`,
        transition: dragging ? 'none' : 'transform 0.25s cubic-bezier(.32,.72,0,1)',
        boxShadow: dx > 0 ? '-8px 0 24px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      {children}
    </div>
  );
}
