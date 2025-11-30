// Type definitions for FSRS Flashcard Application

export type Collection = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type Card = {
  id: string;
  collectionId: string;
  front: string;       // markdown text
  back: string;        // markdown text
  createdAt: string;
  updatedAt: string;

  noteId?: string | null; // optional external note reference

  // FSRS scheduling fields
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  lastReview?: string;
  state: number; // FSRS state: 0=New, 1=Learning, 2=Review, 3=Relearning
  learningSteps?: number;
  scheduledDays?: number;
  elapsedDays?: number;
};

export type AppConfig = {
  username: string;
  password: string;
  apiToken?: string;
};

export type ReviewStats = {
  dueCount: number;
  newCount: number;
  totalCount: number;
};
