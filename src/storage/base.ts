export interface IStorer {
  set<T>(key: string, value: T): void
  get<T>(key: string): T | undefined
  delete(key: string): boolean
  has(key: string): boolean
}
