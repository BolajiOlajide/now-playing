import { ZodError } from 'zod'

import { CACHE_DURATION_MS } from './constants'
import {
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
import { ValidationError } from './error'

// NowPlaying allows one to get the currently playing song for a streaming platform
// user.
export class NowPlaying {
  private provider: Providers
  private storageKind: StorageKind
  private useCache: boolean
  private cacheDuration: number
  private storer: IStorer
  private streamer: IStreamer
  private streamerArgs: SpotifyProviderArgs['streamerArgs'] | unknown

  constructor(provider: Providers.SPOTIFY, args: SpotifyProviderArgs)
  constructor(
    provider: Providers,
    args: SpotifyProviderArgs | NoopProviderArgs
  ) {
    try {
      // use zod to guarantee we get the right variable kind in here
      providerSchema.parse(provider)
      this.provider = provider

    this.parseArgs(args)
    this.streamerArgs = args.streamerArgs
    this.storageKind = args.storageKind || StorageKinds.INMEMORY
    this.useCache = args.useCache || true
    this.cacheDuration = args.cacheDuration || CACHE_DURATION_MS;

    // this is whatever storage mechanic the user selects
    this.storer = this.getStorer(this.storageKind)
    this.streamer = this.getStreamer()
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        // We want to display Zod errors one at a time, so we stick
        // to a similar format for returning errors.
        const [firstError] = err.errors
        throw new ValidationError(firstError.message)
      }
      throw new Error((err as Error)?.message)
    }
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
