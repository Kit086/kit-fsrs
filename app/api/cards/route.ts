import { NextRequest, NextResponse } from 'next/server';
import { 
  getCards, 
  createCard as saveCard, 
  getCardsByCollection,
  getCollections,
  getCardByNoteId,
  getAllDueCards,
  getNewCards,
} from '@/lib/storage';
import { isAuthenticated, validateApiToken } from '@/lib/auth';
import { createNewCard } from '@/lib/fsrs';

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
  
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get('collectionId');
  const due = searchParams.get('due');
  const newOnly = searchParams.get('new');
  
  let cards;
  
  if (due === 'true') {
    cards = collectionId 
      ? getAllDueCards().filter(c => c.collectionId === collectionId)
      : getAllDueCards();
  } else if (newOnly === 'true') {
    cards = collectionId 
      ? getNewCards(collectionId)
      : getNewCards();
  } else if (collectionId) {
    cards = getCardsByCollection(collectionId);
  } else {
    cards = getCards();
  }
  
  return NextResponse.json(cards);
}

export async function POST(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { front, back, noteId } = body;
    
    // Support both 'collection' (name) and 'collectionId' (id)
    let collectionId = body.collectionId;
    
    if (!collectionId && body.collection) {
      // Find collection by name
      const collections = getCollections();
      const col = collections.find(c => c.name === body.collection);
      if (!col) {
        return NextResponse.json(
          { error: `Collection "${body.collection}" not found` },
          { status: 404 }
        );
      }
      collectionId = col.id;
    }
    
    if (!collectionId || !front || !back) {
      return NextResponse.json(
        { error: 'collectionId (or collection), front, and back are required' },
        { status: 400 }
      );
    }
    
    // Check if card with same noteId exists
    if (noteId) {
      const existing = getCardByNoteId(noteId);
      if (existing) {
        return NextResponse.json(
          { error: 'Card with this noteId already exists', existingCard: existing },
          { status: 409 }
        );
      }
    }
    
    const card = createNewCard(collectionId, front, back, noteId);
    saveCard(card);
    
    return NextResponse.json(card, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}
