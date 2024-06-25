export interface IStorer {
    set<T>(key: string, value: T, duration: number): void
    get<T>(key: string): T | undefined
    delete(key: string): boolean
    has(key: string): boolean
    clear(): void
    pruneExpiredEntries(): void
}

export interface CacheData<T> {
    value: T
    expiresAt: number
}
