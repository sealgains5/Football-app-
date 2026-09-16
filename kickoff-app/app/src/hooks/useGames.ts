import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { GameFormat, GamePlayerStatus } from '../types/database';
import { initialsOf, type Game, type RosterPlayer } from '../types/domain';
import { notify } from './useNotifications';

interface RawProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface RawRosterEntry {
  player_id: string;
  position: string | null;
  status: GamePlayerStatus;
  paid: boolean;
  profile: RawProfile | null;
}

interface RawGame {
  id: string;
  organiser_id: string;
  title: string;
  format: GameFormat;
  game_date: string;
  game_time: string;
  location: string;
  pitch: string;
  spots: number;
  cost: number;
  skill_level: string;
  is_private: boolean;
  tags: string[];
  organiser: RawProfile | null;
  game_players: RawRosterEntry[];
}

const GAME_SELECT = `
  id, organiser_id, title, format, game_date, game_time, location, pitch, spots, cost,
  skill_level, is_private, tags,
  organiser:profiles ( id, full_name, avatar_url ),
  game_players ( player_id, position, status, paid, profile:profiles ( id, full_name, avatar_url ) )
`;

function toRosterPlayer(entry: RawRosterEntry): RosterPlayer {
  const name = entry.profile?.full_name || 'Player';
  return {
    id: entry.player_id,
    name,
    initials: initialsOf(name),
    avatarUrl: entry.profile?.avatar_url ?? null,
    position: entry.position,
    status: entry.status,
    paid: entry.paid,
  };
}

function toGame(row: RawGame): Game {
  const players = row.game_players.filter((p) => p.status === 'joined').map(toRosterPlayer);
  const waitlist = row.game_players.filter((p) => p.status === 'waitlist').map(toRosterPlayer);
  const requested = row.game_players.filter((p) => p.status === 'requested').map(toRosterPlayer);
  const organiserName = row.organiser?.full_name || 'Organiser';
  return {
    id: row.id,
    title: row.title,
    format: row.format,
    date: row.game_date,
    time: row.game_time,
    location: row.location,
    pitch: row.pitch,
    spots: row.spots,
    cost: Number(row.cost),
    skill: row.skill_level,
    isPrivate: row.is_private,
    tags: row.tags,
    organiserId: row.organiser_id,
    organiserName,
    organiserInitials: initialsOf(organiserName),
    joinedCount: players.length,
    waitlist,
    requested,
    players,
  };
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('games')
      .select(GAME_SELECT)
      .order('game_date', { ascending: true })
      .returns<RawGame[]>();
    if (err) setError(err.message);
    else {
      setGames(data.map(toGame));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { games, loading, error, refresh };
}

export async function fetchGame(gameId: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select(GAME_SELECT)
    .eq('id', gameId)
    .maybeSingle()
    .returns<RawGame | null>();
  if (error || !data) return null;
  return toGame(data);
}

export interface NewGameInput {
  title: string;
  format: GameFormat;
  date: string;
  time: string;
  location: string;
  pitch: string;
  spots: number;
  cost: number;
  skill: string;
  isPrivate: boolean;
}

export async function createGame(organiserId: string, input: NewGameInput): Promise<string> {
  const { data, error } = await supabase
    .from('games')
    .insert({
      organiser_id: organiserId,
      title: input.title,
      format: input.format,
      game_date: input.date,
      game_time: input.time,
      location: input.location,
      pitch: input.pitch,
      spots: input.spots,
      cost: input.cost,
      skill_level: input.skill,
      is_private: input.isPrivate,
      tags: ['New'],
    })
    .select('id')
    .single();
  if (error) throw error;
  await supabase.from('game_players').insert({ game_id: data.id, player_id: organiserId, status: 'joined', position: null, paid: true });
  return data.id;
}

export async function joinGame(gameId: string, playerId: string, opts: { isFull: boolean }) {
  const status: GamePlayerStatus = opts.isFull ? 'waitlist' : 'joined';
  const { error } = await supabase
    .from('game_players')
    .upsert({ game_id: gameId, player_id: playerId, status, paid: false, position: null }, { onConflict: 'game_id,player_id' });
  if (error) throw error;

  const [{ data: game }, { data: player }] = await Promise.all([
    supabase.from('games').select('organiser_id, title').eq('id', gameId).single(),
    supabase.from('profiles').select('full_name').eq('id', playerId).single(),
  ]);
  if (game && player && game.organiser_id !== playerId) {
    const verb = status === 'waitlist' ? 'joined the waitlist for' : 'joined';
    await notify(game.organiser_id, 'join', `${player.full_name} ${verb} your ${game.title}`, { relatedGameId: gameId, relatedUserId: playerId });
  }
  return status;
}

export async function markPaid(gameId: string, playerId: string) {
  const { error } = await supabase
    .from('game_players')
    .update({ paid: true, status: 'joined' })
    .eq('game_id', gameId)
    .eq('player_id', playerId);
  if (error) throw error;
}

export async function setRosterStatus(gameId: string, playerId: string, status: GamePlayerStatus) {
  const { error } = await supabase.from('game_players').update({ status }).eq('game_id', gameId).eq('player_id', playerId);
  if (error) throw error;
}

export async function removeFromRoster(gameId: string, playerId: string) {
  const { error } = await supabase.from('game_players').delete().eq('game_id', gameId).eq('player_id', playerId);
  if (error) throw error;
}

export async function fetchMyGameIds(playerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('game_players')
    .select('game_id')
    .eq('player_id', playerId)
    .eq('status', 'joined');
  if (error) return [];
  return data.map((r) => r.game_id);
}
