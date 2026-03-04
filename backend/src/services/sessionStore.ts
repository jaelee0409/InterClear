/**
 * Simple session store — in-memory with optional JSON file backup.
 * Upgrade path: swap this file for a Postgres/SQLite implementation
 * without touching any routes.
 */
import fs from 'fs';
import path from 'path';
import type { SessionRecord } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'sessions.json');

// ─── Load from disk on startup ────────────────────────────────────────────────

function loadFromDisk(): SessionRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as SessionRecord[];
  } catch {
    return [];
  }
}

function saveToDisk(sessions: SessionRecord[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('[sessionStore] Failed to persist sessions:', err);
  }
}

const sessions: SessionRecord[] = loadFromDisk();

// ─── Public API ──────────────────────────────────────────────────────────────

export function saveSession(record: SessionRecord): SessionRecord {
  sessions.unshift(record); // newest first
  saveToDisk(sessions);
  return record;
}

export function getSessions(limit = 50): SessionRecord[] {
  return sessions.slice(0, limit);
}

export function getSession(id: string): SessionRecord | undefined {
  return sessions.find((s) => s.id === id);
}
