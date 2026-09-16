import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProfileRow } from '../types/database';
import { initialsOf, type Profile } from '../types/domain';

async function countGamesPlayed(playerId: string): Promise<number> {
  const { count } = await supabase
    .from('game_players')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', playerId)
    .eq('status', 'joined');
  return count ?? 0;
}

async function countFollowEdges(column: 'followee_id' | 'follower_id', value: string): Promise<number> {
  const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq(column, value);
  return count ?? 0;
}

export async function toProfile(row: ProfileRow): Promise<Profile> {
  const [gamesPlayed, followers, following] = await Promise.all([
    countGamesPlayed(row.id),
    countFollowEdges('followee_id', row.id),
    countFollowEdges('follower_id', row.id),
  ]);
  return {
    id: row.id,
    name: row.full_name || 'Player',
    initials: initialsOf(row.full_name || 'P'),
    avatarUrl: row.avatar_url,
    bio: row.bio,
    location: row.location,
    positions: row.positions,
    skillRating: row.skill_rating,
    gamesPlayed,
    followers,
    following,
  };
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return toProfile(data);
}

export function usePlayerSearch(query: string, excludeId?: string) {
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    let req = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
    if (query.trim()) req = req.or(`full_name.ilike.%${query}%,location.ilike.%${query}%`);
    const { data, error } = await req;
    if (!error && data) {
      const filtered = excludeId ? data.filter((p) => p.id !== excludeId) : data;
      setPlayers(await Promise.all(filtered.map(toProfile)));
    }
    setLoading(false);
  }, [query, excludeId]);

  useEffect(() => {
    run();
  }, [run]);

  return { players, loading, refresh: run };
}
