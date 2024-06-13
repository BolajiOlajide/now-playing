import type { IStorer } from "./types";

interface DataEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryStorage implements IStorer {
  private data: Map<string, DataEntry<unknown>> = new Map();

  set<T>(key: string, value: T, duration?: number): void {
    const expiresAt = duration ? Date.now() + duration : Infinity;

    this.data.set(key, {
      value,
      expiresAt,
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.data.get(key);

    if (entry && this.entryIsStillValid(entry)) {
      return entry.value as T;
    } else {
      this.data.delete(key);
    }

    return undefined;
  }

  has(key: string): boolean {
    const entry = this.data.get(key);

    if (entry && this.entryIsStillValid(entry)) {
      return true;
    } else {
      this.data.delete(key);
      return false;
    }
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  keys(): IterableIterator<string> {
    return this.data.keys();
  }

  pruneExpiredEntries(): void {
    const now = Date.now();

    for (const [key, entry] of this.data) {
      if (!this.entryIsStillValid(entry)) {
        this.data.delete(key);
      }
    }
  }

  private entryIsStillValid(entry: DataEntry<unknown>): boolean {
    return entry.expiresAt > Date.now() || entry.expiresAt === Infinity;
  }
}
