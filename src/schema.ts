import { z } from 'zod'
import type { IStorer } from './storage'

export enum Providers {
  SPOTIFY = 'SPOTIFY',
  NOOP = 'NOOP',
}

export const providerSchema = z.nativeEnum(Providers)

export const BaseNowPlayingArgsSchema = z.object({
  useCache: z.boolean().optional(),
  cacheDuration: z.number().optional(),
  storer: z
    .custom<IStorer>(
      (data: unknown): data is IStorer => {
        return (
          typeof data === 'object' &&
          data !== null &&
          typeof (data as IStorer).set === 'function' &&
          typeof (data as IStorer).get === 'function' &&
          typeof (data as IStorer).delete === 'function' &&
          typeof (data as IStorer).has === 'function' &&
          typeof (data as IStorer).clear === 'function' &&
          typeof (data as IStorer).pruneExpiredEntries === 'function'
        )
      },
      {
        message: 'Object does not implement IStorer interface',
      }
    )
    .optional(),
})
export type BaseNowPlayingArgs = z.infer<typeof BaseNowPlayingArgsSchema>

export const SpotifyStreamerArgsSchema = z.object({
  clientId: z.string({
    message: 'Spotify client ID (clientId) is required',
    required_error: 'Spotify client ID (clientId) is required',
  }),
  clientSecret: z.string({
    message: 'Spotify client secret (clientSecret) is required',
    required_error: 'Spotify client secret (clientSecret) is required',
  }),
  refreshToken: z.string({
    message: 'Spotify refresh token (refreshToken) is required',
    required_error: 'Spotify refresh token (refreshToken) is required',
  }),
})
export type SpotifyStreamerArgs = z.infer<typeof SpotifyStreamerArgsSchema>

export const SpotifyProviderArgsSchema = BaseNowPlayingArgsSchema.extend({
  streamerArgs: SpotifyStreamerArgsSchema,
})
export type SpotifyProviderArgs = z.infer<typeof SpotifyProviderArgsSchema>

export const NoopProviderArgsSchema = BaseNowPlayingArgsSchema.extend({
  streamerArgs: z.never(),
})
export type NoopProviderArgs = z.infer<typeof NoopProviderArgsSchema>
