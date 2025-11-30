'use client';

import { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

type Card = {
  id: string;
  front: string;
  back: string;
  collectionId: string;
};

type ReviewOption = {
  rating: number;
  interval: string;
};

type Props = {
  card: Card;
  collectionName?: string;
  onReview: (cardId: string, rating: number) => Promise<void>;
  onSkip?: () => void;
};

const ratingLabels: Record<number, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
};

const ratingColors: Record<number, string> = {
  1: 'bg-red-500 hover:bg-red-600',
  2: 'bg-orange-500 hover:bg-orange-600',
  3: 'bg-green-500 hover:bg-green-600',
  4: 'bg-blue-500 hover:bg-blue-600',
};

export function ReviewCard({ card, collectionName, onReview, onSkip }: Props) {
  const [showBack, setShowBack] = useState(false);
  const [options, setOptions] = useState<ReviewOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch review options when card changes
    setShowBack(false);
    fetch(`/api/cards/${card.id}/review`)
      .then(res => res.json())
      .then(setOptions)
      .catch(() => {});
  }, [card.id]);

  const handleRating = async (rating: number) => {
    setSubmitting(true);
    try {
      await onReview(card.id, rating);
    } finally {
      setSubmitting(false);
    }
  };

  const getInterval = (rating: number): string => {
    const option = options.find(o => o.rating === rating);
    return option?.interval || '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Collection name */}
      {collectionName && (
        <div className="text-sm text-[var(--foreground)] opacity-60 mb-2">
          📁 {collectionName}
        </div>
      )}

      {/* Card content */}
      <div className="flex-1 overflow-auto">
        {/* Front */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Question</div>
          <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] overflow-auto max-h-[40vh]">
            <MarkdownRenderer content={card.front} />
          </div>
        </div>

        {/* Back (revealed) */}
        {showBack && (
          <div className="mb-6">
            <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Answer</div>
            <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] overflow-auto max-h-[40vh]">
              <MarkdownRenderer content={card.back} />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-[var(--border-color)]">
        {!showBack ? (
          <div className="flex gap-3">
            <button
              onClick={() => setShowBack(true)}
              className="flex-1 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              Show Answer
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
              >
                Skip
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(rating => (
              <button
                key={rating}
                onClick={() => handleRating(rating)}
                disabled={submitting}
                className={`py-3 px-2 rounded-lg text-white font-medium disabled:opacity-50 transition-colors ${ratingColors[rating]}`}
              >
                <div className="text-sm">{ratingLabels[rating]}</div>
                <div className="text-xs opacity-80">{getInterval(rating)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
