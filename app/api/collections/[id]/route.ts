import { NextRequest, NextResponse } from 'next/server';
import { getCollection, updateCollection, deleteCollection } from '@/lib/storage';
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

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  const collection = getCollection(id);
  
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }
  
  return NextResponse.json(collection);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  try {
    const { name, description } = await request.json();
    
    const updated = updateCollection(id, { 
      name: name?.trim(), 
      description: description?.trim() 
    });
    
    if (!updated) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  if (!deleteCollection(id)) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
