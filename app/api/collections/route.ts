import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { 
  getCollections, 
  createCollection, 
  getCardsByCollection 
} from '@/lib/storage';
import { isAuthenticated, validateApiToken } from '@/lib/auth';
import { Collection } from '@/lib/types';

// Check authentication (session or API token)
const checkAuth = async (request: NextRequest): Promise<boolean> => {
  // Check session first
  if (await isAuthenticated()) return true;
  
  // Check API token
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
  
  const collections = getCollections();
  
  // Add card counts
  const collectionsWithCounts = collections.map(c => ({
    ...c,
    cardCount: getCardsByCollection(c.id).length,
  }));
  
  return NextResponse.json(collectionsWithCounts);
}

export async function POST(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { name, description } = await request.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const now = new Date().toISOString();
    const collection: Collection = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    
    createCollection(collection);
    return NextResponse.json(collection, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
