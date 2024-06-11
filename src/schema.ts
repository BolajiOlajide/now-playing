import { z } from 'zod'

export const spotifyProviderSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  refreshToken: z.string(),
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
