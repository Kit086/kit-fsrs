import { NextRequest, NextResponse } from 'next/server';
import { Rating, Grade } from 'ts-fsrs';
import { getCard, updateCard } from '@/lib/storage';
import { isAuthenticated, validateApiToken } from '@/lib/auth';
import { processReview, getReviewOptions } from '@/lib/fsrs';

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

type RouteParams = { params: Promise<{ id: string }> };

// GET - Get review options (intervals for each rating)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  const card = getCard(id);
  
  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }
  
  const options = getReviewOptions(card);
  return NextResponse.json(options);
}

// POST - Submit a review rating
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  try {
    const { rating } = await request.json();
    
    // Validate rating (1-4 maps to Again, Hard, Good, Easy)
    if (![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json(
        { error: 'Rating must be 1 (Again), 2 (Hard), 3 (Good), or 4 (Easy)' },
        { status: 400 }
      );
    }
    
    const card = getCard(id);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    
    // Process review with FSRS
    // Rating enum: Again=1, Hard=2, Good=3, Easy=4
    const fsrsRating = rating as Grade;
    const updates = processReview(card, fsrsRating);
    
    const updated = updateCard(id, updates);
    
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: 'Failed to process review' },
      { status: 500 }
    );
  }
}
