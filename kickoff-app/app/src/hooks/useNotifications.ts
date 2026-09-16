import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { NotificationType } from '../types/database';
import { initialsOf, timeAgo, type AppNotification } from '../types/domain';

interface RawNotification {
  id: string;
  type: NotificationType;
  text: string;
  read: boolean;
  created_at: string;
  related_game_id: string | null;
  related_user_id: string | null;
  related_user: { full_name: string } | null;
}

const NOTIF_SELECT = `
  id, type, text, read, created_at, related_game_id, related_user_id,
  related_user:profiles!notifications_related_user_id_fkey ( full_name )
`;

function toNotification(row: RawNotification): AppNotification {
  return {
    id: row.id,
    type: row.type,
    text: row.text,
    time: timeAgo(row.created_at),
    read: row.read,
    avatar: row.related_user ? initialsOf(row.related_user.full_name) : null,
    relatedGameId: row.related_game_id,
    relatedUserId: row.related_user_id,
  };
}

export async function notify(
  userId: string,
  type: NotificationType,
  text: string,
  opts: { relatedGameId?: string; relatedUserId?: string } = {}
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    text,
    related_game_id: opts.relatedGameId ?? null,
    related_user_id: opts.relatedUserId ?? null,
  });
}

export function useNotifications(myId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!myId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select(NOTIF_SELECT)
      .eq('user_id', myId)
      .order('created_at', { ascending: false })
      .returns<RawNotification[]>();
    if (!error && data) setNotifications(data.map(toNotification));
    setLoading(false);
  }, [myId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    if (!myId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', myId).eq('read', false);
  }, [myId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markAllRead, refresh };
}
