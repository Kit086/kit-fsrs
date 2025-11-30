// Authentication utilities
import { cookies } from 'next/headers';
import { getConfig } from './storage';

const SESSION_COOKIE_NAME = 'fsrs_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fsrs-secret-key-change-in-production';

// Simple hash function for session token
const hashToken = (username: string, timestamp: number): string => {
  const data = `${username}:${timestamp}:${SESSION_SECRET}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + timestamp.toString(36);
};

export const createSession = async (username: string): Promise<string> => {
  const timestamp = Date.now();
  const token = hashToken(username, timestamp);
  const sessionData = JSON.stringify({ username, timestamp, token });
  const encoded = Buffer.from(sessionData).toString('base64');
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  return encoded;
};

export const getSession = async (): Promise<{ username: string; timestamp: number } | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) return null;
  
  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session = JSON.parse(decoded);
    
    // Verify token
    const expectedToken = hashToken(session.username, session.timestamp);
    if (session.token !== expectedToken) return null;
    
    // Check if session is not too old (7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - session.timestamp > maxAge) return null;
    
    return { username: session.username, timestamp: session.timestamp };
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
};

export const validateCredentials = (username: string, password: string): boolean => {
  const config = getConfig();
  return config.username === username && config.password === password;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};

// API token authentication
export const validateApiToken = (token: string): boolean => {
  const config = getConfig();
  return config.apiToken === token;
};
