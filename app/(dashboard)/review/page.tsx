'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewCard } from '@/components/ReviewCard';

type Card = {
  id: string;
  front: string;
  back: string;
  collectionId: string;
};

type Collection = {
  id: string;
  name: string;
};

export default function ReviewPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/cards?due=true').then(res => res.json()),
      fetch('/api/collections').then(res => res.json()),
    ])
      .then(([c, cols]) => {
        setCards(c);
        setCollections(cols);
      })
      .finally(() => setLoading(false));
  }, []);

  const getCollectionName = (collectionId: string) => {
    return collections.find(c => c.id === collectionId)?.name;
  };

  const handleReview = async (cardId: string, rating: number) => {
    await fetch(`/api/cards/${cardId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });

    setCompleted(prev => prev + 1);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // All cards reviewed
      setCards([]);
    }
  };

  const handleSkip = () => {
    if (currentIndex < cards.length - 1) {
      // Move current card to end
      const newCards = [...cards];
      const [skipped] = newCards.splice(currentIndex, 1);
      newCards.push(skipped);
      setCards(newCards);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="p-4 md:p-8 md:pl-8 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">All done!</h1>
        <p className="text-sm opacity-60 mb-6">
          {completed > 0
            ? `You reviewed ${completed} card${completed !== 1 ? 's' : ''}.`
            : 'No cards due for review.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const remaining = cards.length - currentIndex;

  return (
    <div className="p-4 md:p-8 md:pl-8 flex flex-col min-h-screen">
      {/* Progress */}
      <div className="mb-4 mt-10 md:mt-0">
        <div className="flex justify-between text-sm mb-2">
          <span className="opacity-60">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="opacity-60">{remaining} remaining</span>
        </div>
        <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Review card */}
      <div className="flex-1">
        <ReviewCard
          card={currentCard}
          collectionName={getCollectionName(currentCard.collectionId)}
          onReview={handleReview}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
