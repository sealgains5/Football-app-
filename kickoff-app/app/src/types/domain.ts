import type { GameFormat, GamePlayerStatus, NotificationType } from './database';

export interface Profile {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  bio: string;
  location: string;
  positions: string[];
  skillRating: number | null;
  gamesPlayed: number;
  followers: number;
  following: number;
}

export interface RosterPlayer {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  position: string | null;
  status: GamePlayerStatus;
  paid: boolean;
}

export interface Game {
  id: string;
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
  tags: string[];
  organiserId: string;
  organiserName: string;
  organiserInitials: string;
  joinedCount: number;
  waitlist: RosterPlayer[];
  requested: RosterPlayer[];
  players: RosterPlayer[];
}

export interface ChatMessage {
  id: string;
  from: string;
  avatar: string;
  text: string;
  time: string;
  mine: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  text: string;
  time: string;
  read: boolean;
  avatar: string | null;
  relatedGameId: string | null;
  relatedUserId: string | null;
}

export interface SquadGroup {
  id: string;
  name: string;
  members: RosterPlayer[];
  games: number;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
