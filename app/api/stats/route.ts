import { NextRequest, NextResponse } from 'next/server';
import { getCards, getCollections, getAllDueCards, getNewCards } from '@/lib/storage';
import { isAuthenticated, validateApiToken } from '@/lib/auth';

// Check authentication
const checkAuth = async (request: NextRequest): Promise<boolean> => {
  if (await isAuthenticated()) return true;
  
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return validateApiToken(token);
  }
  
  return false;
};

export async function GET(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const cards = getCards();
  const collections = getCollections();
  const dueCards = getAllDueCards();
  const newCards = getNewCards();
  
  // Calculate per-collection stats
  const collectionStats = collections.map(c => {
    const collectionCards = cards.filter(card => card.collectionId === c.id);
    const collectionDue = dueCards.filter(card => card.collectionId === c.id);
    const collectionNew = newCards.filter(card => card.collectionId === c.id);
    
    return {
      id: c.id,
      name: c.name,
      totalCards: collectionCards.length,
      dueCards: collectionDue.length,
      newCards: collectionNew.length,
    };
  });
  
  return NextResponse.json({
    totalCollections: collections.length,
    totalCards: cards.length,
    dueCards: dueCards.length,
    newCards: newCards.length,
    collections: collectionStats,
  });
}
