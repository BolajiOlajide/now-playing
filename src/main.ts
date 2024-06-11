import {
  type Provider,
  type StorageKind,
  StorageKinds,
  providerSchema,
  Providers,
  type NowPlayingArgs,
  NowPlayingArgsSchema,
} from './schema'
import { InMemoryStorage, type IStorer } from './storage'
import { SpotifyStreamer, type IStreamer } from './streamers'

// NowPlaying allows one to get the currently playing song for a streaming platform
// user. I
export class NowPlaying {
  private storer: IStorer
  private provider: Provider
  private storageKind: StorageKind
  private streamer: IStreamer

  constructor(
    provider: Provider,
    args: NowPlayingArgs
  ) {
    // use zod to guarantee we get the right variable kind in here
    providerSchema.parse(provider)
    NowPlayingArgsSchema.parse(args)

    this.provider = provider
    this.storageKind = args.storageKind

    // this is whatever storage mechanic the user selects
    this.storer = this.getStorer(this.storageKind)
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

  private getStreamer(): IStreamer {
    switch (this.provider) {
      case Providers.SPOTIFY:
        return new SpotifyStreamer()
      default:
        throw new Error('unsupported provider')
    }
  }

  // private
}
