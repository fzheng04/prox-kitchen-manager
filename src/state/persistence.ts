import { initialState } from './reducer';
import type { KeyValueStore } from './storage';
import type { AppState } from './types';

export const STORAGE_KEY = 'prox:state';
export const SCHEMA_VERSION = 1;

type Envelope = { schemaVersion: number; state: AppState };

export type LoadResult =
  | { status: 'restored'; state: AppState }
  | { status: 'fresh'; state: AppState }
  /** Saved data existed but couldn't be read; the app starts from the seed and says so. */
  | { status: 'recovered'; state: AppState; error: string };

function isAppState(value: unknown): value is AppState {
  const s = value as AppState;
  return (
    typeof s === 'object' &&
    s !== null &&
    typeof s.anonymousId === 'string' &&
    Array.isArray(s.lists) &&
    Array.isArray(s.pantry) &&
    Array.isArray(s.trips) &&
    typeof s.clock?.offsetDays === 'number'
  );
}

/**
 * Reads saved state. A missing key starts from the seed with a new anonymous id. Unreadable,
 * corrupt or unknown-version data starts from the seed too, but reports why so the UI can tell the user.
 */
export async function loadState(store: KeyValueStore, newAnonymousId: () => string): Promise<LoadResult> {
  let raw: string | null;
  try {
    raw = await store.getItem(STORAGE_KEY);
  } catch (e) {
    return { status: 'recovered', state: initialState(newAnonymousId()), error: `Couldn't read saved data (${message(e)}).` };
  }
  if (raw === null) return { status: 'fresh', state: initialState(newAnonymousId()) };
  try {
    const envelope = JSON.parse(raw) as Envelope;
    if (envelope.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`unsupported schema version ${String(envelope.schemaVersion)}`);
    }
    if (!isAppState(envelope.state)) throw new Error('saved data has an unexpected shape');
    return { status: 'restored', state: envelope.state };
  } catch (e) {
    return { status: 'recovered', state: initialState(newAnonymousId()), error: `Saved data was unreadable (${message(e)}).` };
  }
}

export async function saveState(store: KeyValueStore, state: AppState): Promise<void> {
  const envelope: Envelope = { schemaVersion: SCHEMA_VERSION, state };
  await store.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
