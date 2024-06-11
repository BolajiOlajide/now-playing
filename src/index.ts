import { z } from 'zod'

import type { IStorer } from './storage/base'
import { InMemoryStorage } from './storage/inmemory'

export const Providers = {
  SPOTIFY: 'SPOTIFY',
} as const

const providerSchema = z.nativeEnum(Providers)
type Provider = z.infer<typeof providerSchema>

export const StorageKinds = {
  INMEMORY: 'INMEMORY',
  SQLITE: 'SQLITE',
} as const

const storageKindSchema = z.nativeEnum(StorageKinds)
type StorageKind = z.infer<typeof storageKindSchema>

export class NowPlaying {
  private storer: IStorer
  private provider: Provider
  private storageKind: StorageKind

  constructor(
    provider: Provider,
    storageKind: StorageKind = StorageKinds.INMEMORY,
  ) {
    // use zod to guarantee we get the right variable kind in here
    providerSchema.parse(provider)
    storageKindSchema.parse(storageKind)

    this.provider = provider
    this.storageKind = storageKind

    // this is whatever storage mechanic the user selects
    this.storer = this.getStorer(storageKind)
  }

  private getStorer(storageKind: StorageKind): IStorer {
    switch (storageKind) {
      case StorageKinds.INMEMORY:
        return new InMemoryStorage()
      default:
        throw new Error('Unknown storage kind')
    }
  }
}
