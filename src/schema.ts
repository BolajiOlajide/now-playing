import * as z from 'zod'

export const spotifyProviderSchema = z.object({
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

export const Providers = {
  SPOTIFY: 'SPOTIFY',
} as const

export const providerSchema = z.nativeEnum(Providers)
export type Provider = z.infer<typeof providerSchema>

export const StorageKinds = {
  INMEMORY: 'INMEMORY',
  SQLITE: 'SQLITE',
} as const

export const storageKindSchema = z.nativeEnum(StorageKinds)
export type StorageKind = z.infer<typeof storageKindSchema>
