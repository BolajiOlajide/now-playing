import {
  type Provider,
  type StorageKind,
  StorageKinds,
  providerSchema,
  storageKindSchema
} from './schema'
import type { IStorer } from './storage/base'
import { InMemoryStorage } from './storage/inmemory'

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
        throw new Error('unsupported storage kind')
    }
  }
}
