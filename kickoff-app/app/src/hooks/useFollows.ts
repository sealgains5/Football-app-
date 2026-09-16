import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { notify } from './useNotifications';

export function useFollowing(myId: string | undefined) {
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!myId) {
      setFollowing(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('follows').select('followee_id').eq('follower_id', myId);
    setFollowing(new Set((data ?? []).map((r) => r.followee_id)));
    setLoading(false);
  }, [myId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleFollow = useCallback(
    async (targetId: string, targetName: string) => {
      if (!myId || targetId === myId) return;
      const isFollowing = following.has(targetId);
      setFollowing((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.delete(targetId);
        else next.add(targetId);
        return next;
      });
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', myId).eq('followee_id', targetId);
      } else {
        await supabase.from('follows').insert({ follower_id: myId, followee_id: targetId });
        await notify(targetId, 'follow', `${targetName} started following you`, { relatedUserId: myId });
      }
    },
    [myId, following]
  );

  return { following, loading, toggleFollow, refresh };
}

export function useFollowerCount(userId: string | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('followee_id', userId)
      .then(({ count: c }) => setCount(c ?? 0));
  }, [userId]);

  return count;
}
