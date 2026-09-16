import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { initialsOf, type RosterPlayer, type SquadGroup } from '../types/domain';

interface RawSquad {
  id: string;
  name: string;
  squad_members: { player_id: string; profile: { full_name: string; avatar_url: string | null } | null }[];
}

const SQUAD_SELECT = `id, name, squad_members ( player_id, profile:profiles ( full_name, avatar_url ) )`;

function toGroup(row: RawSquad): SquadGroup {
  const members: RosterPlayer[] = row.squad_members.map((m) => {
    const name = m.profile?.full_name || 'Player';
    return {
      id: m.player_id,
      name,
      initials: initialsOf(name),
      avatarUrl: m.profile?.avatar_url ?? null,
      position: null,
      status: 'joined',
      paid: false,
    };
  });
  return { id: row.id, name: row.name, members, games: 0 };
}

export function useSquads(ownerId: string | undefined) {
  const [groups, setGroups] = useState<SquadGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!ownerId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('squads')
      .select(SQUAD_SELECT)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: true })
      .returns<RawSquad[]>();
    if (!error && data) setGroups(data.map(toGroup));
    setLoading(false);
  }, [ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createSquad = useCallback(
    async (name: string) => {
      if (!ownerId || !name.trim()) return;
      await supabase.from('squads').insert({ owner_id: ownerId, name: name.trim() });
      await refresh();
    },
    [ownerId, refresh]
  );

  return { groups, loading, createSquad, refresh };
}
