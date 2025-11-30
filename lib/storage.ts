// File-based storage utilities
import fs from 'fs';
import path from 'path';
import { Collection, Card, AppConfig } from './types';

// Get data directory from environment variable
const getDataDir = (): string => {
  const dataDir = process.env.APP_DATA_DIR || './data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
};

const getFilePath = (filename: string): string => {
  return path.join(getDataDir(), filename);
};

// Config operations
export const getConfig = (): AppConfig => {
  const configPath = getFilePath('config.json');
  if (!fs.existsSync(configPath)) {
    const defaultConfig: AppConfig = {
      username: 'admin',
      password: 'password',
      apiToken: 'your-api-token-here',
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
};

// Collection operations
export const getCollections = (): Collection[] => {
  const filePath = getFilePath('collections.json');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export const saveCollections = (collections: Collection[]): void => {
  const filePath = getFilePath('collections.json');
  fs.writeFileSync(filePath, JSON.stringify(collections, null, 2));
};

export const getCollection = (id: string): Collection | undefined => {
  return getCollections().find(c => c.id === id);
};

export const createCollection = (collection: Collection): Collection => {
  const collections = getCollections();
  collections.push(collection);
  saveCollections(collections);
  return collection;
};

export const updateCollection = (id: string, updates: Partial<Collection>): Collection | null => {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  collections[index] = {
    ...collections[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCollections(collections);
  return collections[index];
};

export const deleteCollection = (id: string): boolean => {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === id);
  if (index === -1) return false;
  
  collections.splice(index, 1);
  saveCollections(collections);
  
  // Also delete all cards in this collection
  const cards = getCards().filter(c => c.collectionId !== id);
  saveCards(cards);
  return true;
};

// Card operations
export const getCards = (): Card[] => {
  const filePath = getFilePath('cards.json');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export const saveCards = (cards: Card[]): void => {
  const filePath = getFilePath('cards.json');
  fs.writeFileSync(filePath, JSON.stringify(cards, null, 2));
};

export const getCard = (id: string): Card | undefined => {
  return getCards().find(c => c.id === id);
};

export const getCardsByCollection = (collectionId: string): Card[] => {
  return getCards().filter(c => c.collectionId === collectionId);
};

export const createCard = (card: Card): Card => {
  const cards = getCards();
  cards.push(card);
  saveCards(cards);
  return card;
};

export const updateCard = (id: string, updates: Partial<Card>): Card | null => {
  const cards = getCards();
  const index = cards.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  cards[index] = {
    ...cards[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCards(cards);
  return cards[index];
};

export const deleteCard = (id: string): boolean => {
  const cards = getCards();
  const index = cards.findIndex(c => c.id === id);
  if (index === -1) return false;
  
  cards.splice(index, 1);
  saveCards(cards);
  return true;
};

// Get due cards for review
export const getDueCards = (collectionId?: string): Card[] => {
  const now = new Date().toISOString();
  let cards = getCards().filter(c => c.due <= now);
  if (collectionId) {
    cards = cards.filter(c => c.collectionId === collectionId);
  }
  return cards.sort((a, b) => a.due.localeCompare(b.due));
};

// Get all due cards across all collections
export const getAllDueCards = (): Card[] => {
  const now = new Date().toISOString();
  return getCards()
    .filter(c => c.due <= now)
    .sort((a, b) => a.due.localeCompare(b.due));
};

// Get new cards (never reviewed)
export const getNewCards = (collectionId?: string): Card[] => {
  let cards = getCards().filter(c => c.reps === 0);
  if (collectionId) {
    cards = cards.filter(c => c.collectionId === collectionId);
  }
  return cards;
};

// Get card by noteId
export const getCardByNoteId = (noteId: string): Card | undefined => {
  return getCards().find(c => c.noteId === noteId);
};
