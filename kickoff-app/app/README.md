# Kickoff

A football (5-a-side / 7-a-side / 11-a-side) game matchmaking app: discover and
join local games, chat with your lineup, pay for your spot, follow other
players, track a self-assessed skill rating, and organise your own games.

This is a production build of the **Kickoff** Claude Design prototype
(`../Football App.html` in the handoff bundle this project came from) — a
React + TypeScript single-page app on [Supabase](https://supabase.com)
(Postgres, Auth, Realtime) for the backend and [Stripe](https://stripe.com)
(test mode) for payments, instead of the prototype's in-browser Babel/mock
data. The Claude-Design-only preview chrome (the fake iPhone frame and the
live design-tweaks panel) was intentionally dropped — this runs as a normal
responsive web app.

## Stack

- **Frontend**: Vite + React 19 + TypeScript, no CSS framework (inline styles,
  ported 1:1 from the design's design-token CSS variables in `src/index.css`).
- **Backend**: Supabase — Postgres with row-level security, Supabase Auth
  (email/password + Google/Facebook/Apple OAuth), Supabase Realtime for game
  chat, and two Supabase Edge Functions for Stripe.
- **Payments**: Stripe PaymentIntents in **test mode**, created server-side by
  an Edge Function so the secret key never reaches the client.

## One-time setup

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then in the SQL
Editor run the migration at
[`../supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql)
(paste its contents and run it, or use the Supabase CLI: `supabase db push`
against the project once it's linked).

This creates all tables (`profiles`, `games`, `game_players`, `messages`,
`follows`, `notifications`, `squads`, `squad_members`, `skill_assessments`,
`ratings`, `payments`), a trigger that creates a `profiles` row on signup, and
RLS policies for all of them.

In **Authentication → Providers**, enable the providers you want (Email is on
by default; enable Google/Facebook/Apple if you want those buttons on the
auth screen to work — otherwise they'll error when tapped). For the smoothest
local testing, also turn off **Confirm email** under Authentication → Email
so new accounts get a session immediately instead of needing to click a
confirmation link.

Grab your project's **Project URL** and **anon public key** from
Settings → API.

### 2. Create a Stripe account (test mode)

Get your **test mode** publishable key (`pk_test_...`) and secret key
(`sk_test_...`) from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys).
No live account or business verification is needed for test mode.

### 3. Deploy the Edge Functions

The two functions in [`../supabase/functions`](../supabase/functions) create
and confirm Stripe PaymentIntents server-side (the Stripe secret key is never
sent to the browser). With the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref your-project-ref
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment
```

(`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are
already available to Edge Functions automatically — no need to set them.)

### 4. Configure the app

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
`VITE_STRIPE_PUBLISHABLE_KEY`.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL. The app is responsive but designed mobile-first
(max-width 480px, centered) — use your browser's device toolbar for the
closest look to the original design.

To test a payment: create or join a game, and on the payment screen use
Stripe's test card `4242 4242 4242 4242`, any future expiry date, and any
3-digit CVC.

```bash
npm run build    # type-checks (tsc -b) and produces dist/
npm run lint      # oxlint
```

## Project structure

```
src/
  components/   shared UI: Icon, Avatar, Tag, GameCard, PlayerCard, BottomNav, SwipeBack…
  screens/      one file per screen (Home, Discover, GameDetail, Payment, Profile, …)
  hooks/        Supabase-backed data hooks (useAuth, useGames, useMessages, …)
  lib/          Supabase + Stripe client setup
  types/        database.ts (schema types) and domain.ts (UI-facing shapes)
supabase/
  migrations/   SQL schema + RLS policies
  functions/    create-payment-intent, confirm-payment (Deno Edge Functions)
```

## Known simplifications

A few things the original design showed but never actually wired up (or that
are out of scope for a first backend pass) were kept honest rather than faked:

- **Profile photo upload** — the edit-profile "+" button is present but not
  wired to Supabase Storage; avatars are generated from initials.
- **"Goals" / "Assists" stats** — the design showed these as static numbers;
  there's no schema for tracking them yet, so they aren't shown until that
  feature exists.
- **Private-game join requests** — the schema supports a `requested` roster
  status and the organiser dashboard can approve/decline it, but nothing in
  the current join flow produces one yet (joining — public or private — goes
  straight to `joined`, matching the original prototype's behavior).
