// FSRS scheduling utilities using ts-fsrs
import { 
  fsrs, 
  FSRS, 
  Card as FSRSCard, 
  State, 
  Rating,
  Grade,
  createEmptyCard,
  RecordLog
} from 'ts-fsrs';
import { Card } from './types';
import { v4 as uuidv4 } from 'uuid';

// Initialize FSRS with default parameters
const f: FSRS = fsrs();

// Create a new card with FSRS defaults
export const createNewCard = (
  collectionId: string,
  front: string,
  back: string,
  noteId?: string | null
): Card => {
  const now = new Date();
  const emptyCard = createEmptyCard(now);
  
  return {
    id: uuidv4(),
    collectionId,
    front,
    back,
    noteId: noteId || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    due: emptyCard.due.toISOString(),
    stability: emptyCard.stability,
    difficulty: emptyCard.difficulty,
    reps: emptyCard.reps,
    lapses: emptyCard.lapses,
    lastReview: emptyCard.last_review?.toISOString(),
    state: emptyCard.state,
    learningSteps: emptyCard.learning_steps,
    scheduledDays: emptyCard.scheduled_days,
    elapsedDays: emptyCard.elapsed_days,
  };
};

// Convert our Card type to FSRS Card type
const toFSRSCard = (card: Card): FSRSCard => {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays ?? 0,
    scheduled_days: card.scheduledDays ?? 0,
    learning_steps: card.learningSteps ?? 0,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as State,
    last_review: card.lastReview ? new Date(card.lastReview) : undefined,
  };
};

// Process a review and get updated card data
export const processReview = (
  card: Card,
  rating: Grade,
  now: Date = new Date()
): Partial<Card> => {
  const fsrsCard = toFSRSCard(card);
  const result: RecordLog = f.repeat(fsrsCard, now);
  
  // Get the scheduled card for the given rating
  const scheduled = result[rating];
  const updatedCard = scheduled.card;
  
  return {
    due: updatedCard.due.toISOString(),
    stability: updatedCard.stability,
    difficulty: updatedCard.difficulty,
    reps: updatedCard.reps,
    lapses: updatedCard.lapses,
    lastReview: now.toISOString(),
    state: updatedCard.state,
    learningSteps: updatedCard.learning_steps,
    scheduledDays: updatedCard.scheduled_days,
    elapsedDays: updatedCard.elapsed_days,
  };
};

// Get next review intervals for all ratings
export const getReviewOptions = (
  card: Card,
  now: Date = new Date()
): { rating: Grade; interval: string }[] => {
  const fsrsCard = toFSRSCard(card);
  const result: RecordLog = f.repeat(fsrsCard, now);
  
  return [
    { rating: Rating.Again, interval: formatInterval(result[Rating.Again].card.due, now) },
    { rating: Rating.Hard, interval: formatInterval(result[Rating.Hard].card.due, now) },
    { rating: Rating.Good, interval: formatInterval(result[Rating.Good].card.due, now) },
    { rating: Rating.Easy, interval: formatInterval(result[Rating.Easy].card.due, now) },
  ];
};

// Format interval for display
const formatInterval = (due: Date, now: Date): string => {
  const diffMs = due.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo`;
  const diffYears = Math.round(diffDays / 365);
  return `${diffYears}y`;
};

// Rating labels
export const ratingLabels: Record<Grade, string> = {
  [Rating.Again]: 'Again',
  [Rating.Hard]: 'Hard',
  [Rating.Good]: 'Good',
  [Rating.Easy]: 'Easy',
};

// Rating colors (for Tailwind classes)
export const ratingColors: Record<Grade, string> = {
  [Rating.Again]: 'bg-red-500 hover:bg-red-600',
  [Rating.Hard]: 'bg-orange-500 hover:bg-orange-600',
  [Rating.Good]: 'bg-green-500 hover:bg-green-600',
  [Rating.Easy]: 'bg-blue-500 hover:bg-blue-600',
};
