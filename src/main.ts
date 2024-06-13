import {
  type Provider,
  type StorageKind,
  StorageKinds,
  providerSchema,
  Providers,
  type NoopProviderArgs,
  type SpotifyProviderArgs,
  SpotifyProviderArgsSchema,
  NoopProviderArgsSchema,
  SpotifyStreamerArgs,
} from './schema'
import { InMemoryStorage, type IStorer } from './storage'
import { SpotifyStreamer, NoopStreamer, type IStreamer, Song } from './streamers'

// NowPlaying allows one to get the currently playing song for a streaming platform
// user. I
export class NowPlaying {
  private provider: Provider
  private storageKind: StorageKind
  private useCache: boolean
  private cacheDuration: number
  private storer: IStorer
  private streamer: IStreamer
  private streamerArgs: SpotifyProviderArgs['streamerArgs'] | NoopProviderArgs['streamerArgs']

  constructor(provider: "NOOP", args: NoopProviderArgs)
  constructor(provider: "SPOTIFY", args: SpotifyProviderArgs)
  constructor(
    provider: Provider,
    args: SpotifyProviderArgs | NoopProviderArgs
  ) {
    // use zod to guarantee we get the right variable kind in here
    providerSchema.parse(provider)
    this.provider = provider

    this.parseArgs(args)
    this.storageKind = args.storageKind
    this.useCache = args.useCache
    this.cacheDuration = args.cacheDuration || 60000;

    // this is whatever storage mechanic the user selects
    this.storer = this.getStorer(this.storageKind)
    this.streamer = this.getStreamer()
    this.streamerArgs = args.streamerArgs
  }

  private parseArgs(args: unknown): void {
    switch (this.provider) {
      case Providers.SPOTIFY:
        SpotifyProviderArgsSchema.parse(args)
        break
      case Providers.NOOP:
        NoopProviderArgsSchema.parse(args)
        break
      default:
        throw new Error('unsupported provider')
    }
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
        return new SpotifyStreamer(this.storer, { ...this.streamerArgs as SpotifyStreamerArgs })
      case Providers.NOOP:
        return new NoopStreamer()
      default:
        throw new Error('unsupported provider')
    }
  }

  fetchCurrentlyPlayingOrLastPlayed(): Promise<Song | null> {
    return this.streamer.fetchCurrentlyPlaying(this.useCache, this.cacheDuration)
  }
}
