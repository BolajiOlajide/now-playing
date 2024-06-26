import { describe, test, beforeEach, expect } from 'vitest'

import { InMemoryStorage } from '../inmemory.storage'

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage

  beforeEach(() => {
    storage = new InMemoryStorage()
  })

  test('should set and get a value', () => {
    const key = 'testKey'
    const value = 'testValue'
    const duration = 1000 * 60 // 1 minute

    storage.set(key, value, duration)
    const retrievedValue = storage.get(key)

    expect(retrievedValue).toBe(value)
  })

  test('should return undefined for an expired entry', () => {
    const key = 'testKey'
    const value = 'testValue'
    const duration = -1000 // Expired

    storage.set(key, value, duration)
    const retrievedValue = storage.get(key)

    expect(retrievedValue).toBeUndefined()
  })

  test('should delete an entry', () => {
    const key = 'testKey'
    const value = 'testValue'
    const duration = 1000 * 60 // 1 minute

    storage.set(key, value, duration)
    storage.delete(key)
    const retrievedValue = storage.get(key)

    expect(retrievedValue).toBeUndefined()
  })

  test('should clear all entries', () => {
    const key1 = 'testKey1'
    const value1 = 'testValue1'
    const key2 = 'testKey2'
    const value2 = 'testValue2'
    const duration = 1000 * 60 // 1 minute

    storage.set(key1, value1, duration)
    storage.set(key2, value2, duration)
    storage.clear()

    expect(storage.get(key1)).toBeUndefined()
    expect(storage.get(key2)).toBeUndefined()
  })

  test('should return keys iterator', () => {
    const key1 = 'testKey1'
    const value1 = 'testValue1'
    const key2 = 'testKey2'
    const value2 = 'testValue2'
    const duration = 1000 * 60 // 1 minute

    storage.set(key1, value1, duration)
    storage.set(key2, value2, duration)

    const keys = Array.from(storage.keys())

    expect(keys).toContain(key1)
    expect(keys).toContain(key2)
  })

  test('should prune expired entries', () => {
    const key1 = 'testKey1'
    const value1 = 'testValue1'
    const key2 = 'testKey2'
    const value2 = 'testValue2'
    const duration1 = 1000 * 60 // 1 minute
    const duration2 = -1000 // Expired

    storage.set(key1, value1, duration1)
    storage.set(key2, value2, duration2)
    storage.pruneExpiredEntries()

    expect(storage.get(key1)).toBe(value1)
    expect(storage.get(key2)).toBeUndefined()
  })
})
