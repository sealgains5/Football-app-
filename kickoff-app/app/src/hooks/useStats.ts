import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface OwnStats {
  avgRating: number | null;
}

export function useReceivedRating(userId: string | undefined) {
  const [stats, setStats] = useState<OwnStats>({ avgRating: null });

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('ratings')
      .select('stars')
      .eq('ratee_id', userId)
      .then(({ data }) => {
        if (!data || data.length === 0) return setStats({ avgRating: null });
        const avg = data.reduce((sum, r) => sum + r.stars, 0) / data.length;
        setStats({ avgRating: Math.round(avg * 10) / 10 });
      });
  }, [userId]);

  return stats;
}
