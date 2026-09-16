// Hand-written mirror of the Supabase schema in supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` if the schema drifts from this file.
//
// These are `type` aliases (not `interface`s) on purpose: TypeScript only infers an
// implicit string index signature for object *type literals*, which is what lets them
// structurally satisfy supabase-js's `Record<string, unknown>`-based `GenericTable`
// constraint. An `interface` here would make every `supabase.from(...)` call resolve to `never`.

export type GameFormat = '5-a-side' | '7-a-side' | '11-a-side';
export type GamePlayerStatus = 'requested' | 'waitlist' | 'joined';
export type NotificationType = 'join' | 'payment' | 'reminder' | 'rating' | 'follow' | 'request';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

export type ProfileRow = {
  id: string;
  full_name: string;
  handle: string | null;
  avatar_url: string | null;
  bio: string;
  location: string;
  positions: string[];
  skill_rating: number | null;
  created_at: string;
};

export type SkillAssessmentRow = {
  id: string;
  user_id: string;
  answers: Record<string, number>;
  rating: number;
  created_at: string;
};

export type GameRow = {
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
  created_at: string;
};

export type GamePlayerRow = {
  id: string;
  game_id: string;
  player_id: string;
  position: string | null;
  status: GamePlayerStatus;
  paid: boolean;
  created_at: string;
};

export type MessageRow = {
  id: string;
  game_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};

export type FollowRow = {
  follower_id: string;
  followee_id: string;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  text: string;
  related_game_id: string | null;
  related_user_id: string | null;
  read: boolean;
  created_at: string;
};

export type SquadRow = {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
};

export type SquadMemberRow = {
  squad_id: string;
  player_id: string;
  created_at: string;
};

export type RatingRow = {
  id: string;
  game_id: string;
  rater_id: string;
  ratee_id: string;
  stars: number;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  user_id: string;
  game_id: string;
  amount: number;
  stripe_payment_intent_id: string | null;
  status: PaymentStatus;
  created_at: string;
};

type Table<Row, Insert, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Partial<ProfileRow> & { id: string }, Partial<ProfileRow>>;
      skill_assessments: Table<SkillAssessmentRow, Omit<SkillAssessmentRow, 'id' | 'created_at'>>;
      games: Table<GameRow, Omit<GameRow, 'id' | 'created_at'> & { id?: string }>;
      game_players: Table<GamePlayerRow, Omit<GamePlayerRow, 'id' | 'created_at'> & { id?: string }>;
      messages: Table<MessageRow, Omit<MessageRow, 'id' | 'created_at'> & { id?: string }>;
      follows: Table<FollowRow, Omit<FollowRow, 'created_at'> & { created_at?: string }>;
      notifications: Table<NotificationRow, Omit<NotificationRow, 'id' | 'created_at' | 'read'> & { id?: string; read?: boolean }>;
      squads: Table<SquadRow, Omit<SquadRow, 'id' | 'created_at'> & { id?: string }>;
      squad_members: Table<SquadMemberRow, SquadMemberRow>;
      ratings: Table<RatingRow, Omit<RatingRow, 'id' | 'created_at'> & { id?: string }>;
      payments: Table<
        PaymentRow,
        Omit<PaymentRow, 'id' | 'created_at' | 'status' | 'stripe_payment_intent_id'> & {
          id?: string;
          status?: PaymentStatus;
          stripe_payment_intent_id?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
