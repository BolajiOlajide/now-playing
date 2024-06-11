import {
  type Provider,
  type StorageKind,
  StorageKinds,
  providerSchema,
  storageKindSchema,
  Providers,
} from './schema'
import { InMemoryStorage, type IStorer } from './storage'
import { SpotifyStreamer, Streamer } from './streamers'

export class NowPlaying {
  private storer: IStorer
  private provider: Provider
  private storageKind: StorageKind
  private streamer: Streamer

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
    this.streamer = this.getStreamer()
  }

  private getStorer(storageKind: StorageKind): IStorer {
    switch (storageKind) {
      case StorageKinds.INMEMORY:
        return new InMemoryStorage()
      default:
        throw new Error('unsupported storage kind')
    }
  }

  private getStreamer(): Streamer {
    switch (this.provider) {
      case Providers.SPOTIFY:
        return new SpotifyStreamer()
      default:
        throw new Error('unsupported provider')
    }
  }

  // private
}
