import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { initialsOf, type ChatMessage } from '../types/domain';

interface RawMessage {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  sender: { full_name: string } | null;
}

const MSG_SELECT = `id, sender_id, text, created_at, sender:profiles ( full_name )`;

function toMessage(row: RawMessage, myId: string | undefined): ChatMessage {
  const name = row.sender?.full_name || 'Player';
  return {
    id: row.id,
    from: name,
    avatar: initialsOf(name),
    text: row.text,
    time: new Date(row.created_at).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }),
    mine: row.sender_id === myId,
  };
}

export function useMessages(gameId: string, myId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select(MSG_SELECT)
      .eq('game_id', gameId)
      .order('created_at', { ascending: true })
      .returns<RawMessage[]>();
    if (!error && data) setMessages(data.map((m) => toMessage(m, myId)));
    setLoading(false);
  }, [gameId, myId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${gameId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `game_id=eq.${gameId}` }, () => {
        refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, refresh]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!myId || !text.trim()) return;
      await supabase.from('messages').insert({ game_id: gameId, sender_id: myId, text: text.trim() });
    },
    [gameId, myId]
  );

  return { messages, loading, sendMessage };
}

export function useLastMessages(gameIds: string[], myId: string | undefined) {
  const [lastByGame, setLastByGame] = useState<Record<string, ChatMessage>>({});
  const key = gameIds.join(',');

  useEffect(() => {
    if (gameIds.length === 0) {
      setLastByGame({});
      return;
    }
    supabase
      .from('messages')
      .select(MSG_SELECT + ', game_id')
      .in('game_id', gameIds)
      .order('created_at', { ascending: false })
      .returns<(RawMessage & { game_id: string })[]>()
      .then(({ data }) => {
        if (!data) return;
        const next: Record<string, ChatMessage> = {};
        for (const row of data) {
          if (!next[row.game_id]) next[row.game_id] = toMessage(row, myId);
        }
        setLastByGame(next);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, myId]);

  return lastByGame;
}
