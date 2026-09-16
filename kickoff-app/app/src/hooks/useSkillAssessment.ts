import { supabase } from '../lib/supabase';

export const ASSESSMENT_QUESTIONS = [
  { key: 'pace', label: 'Pace', icon: 'fire', question: 'How fast are you over short distances?', opts: ['Very slow', 'Below avg', 'Average', 'Above avg', 'Explosive'] },
  { key: 'shooting', label: 'Shooting', icon: 'football', question: 'How clinical are you in front of goal?', opts: ['Rarely score', 'Occasional', 'Decent finish', 'Good finisher', 'Clinical'] },
  { key: 'passing', label: 'Passing', icon: 'share', question: 'How accurate are your passes under pressure?', opts: ['Often misplace', 'Sometimes stray', 'Generally OK', 'Consistent', 'Pinpoint'] },
  { key: 'dribbling', label: 'Dribbling', icon: 'star', question: 'How comfortable are you with the ball at your feet?', opts: ['Very basic', 'Some control', 'Comfortable', 'Skillful', 'Elite control'] },
  { key: 'defending', label: 'Defending', icon: 'users', question: 'How well do you read the game defensively?', opts: ['Rarely track', 'Occasional', 'Average awareness', 'Good positioning', 'Reading play'] },
  { key: 'fitness', label: 'Fitness', icon: 'fire', question: 'How would you rate your overall fitness level?', opts: ['Struggle 20 min', 'OK for 45 min', 'Full 60 min', 'High intensity', 'Elite fitness'] },
  { key: 'experience', label: 'Experience', icon: 'clock', question: 'How many years have you played regularly?', opts: ['Under 1 yr', '1–3 years', '3–6 years', '6–10 years', '10+ years'] },
  { key: 'iq', label: 'Game IQ', icon: 'star', question: 'How well do you read space and make decisions?', opts: ['Often confused', 'Learning', 'Hold my own', 'Smart player', 'Tactical awareness'] },
] as const;

export type SkillKey = (typeof ASSESSMENT_QUESTIONS)[number]['key'];
export type SkillAnswers = Record<SkillKey, number>;

export function computeRating(answers: SkillAnswers): number {
  const vals = Object.values(answers);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 10) / 10;
}

export function ratingLabel(rating: number): string {
  if (rating < 2) return 'Beginner';
  if (rating < 2.8) return 'Recreational';
  if (rating < 3.5) return 'Intermediate';
  if (rating < 4.3) return 'Advanced';
  return 'Elite';
}

export function confidencePct(gamesPlayed: number): number {
  return Math.min(98, 40 + gamesPlayed * 3);
}

export async function submitSkillAssessment(userId: string, answers: SkillAnswers): Promise<number> {
  const rating = computeRating(answers);
  const { error: insertError } = await supabase.from('skill_assessments').insert({ user_id: userId, answers, rating });
  if (insertError) throw insertError;
  const { error: updateError } = await supabase.from('profiles').update({ skill_rating: rating }).eq('id', userId);
  if (updateError) throw updateError;
  return rating;
}

export async function fetchLatestAssessment(userId: string): Promise<SkillAnswers | null> {
  const { data } = await supabase
    .from('skill_assessments')
    .select('answers')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.answers as SkillAnswers | undefined) ?? null;
}
