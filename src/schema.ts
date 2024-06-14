import * as z from "zod";

export enum Providers {
  SPOTIFY = 'SPOTIFY',
  NOOP = 'NOOP',
}

export const providerSchema = z.nativeEnum(Providers);
// export type Provider = z.infer<typeof providerSchema>;

export const StorageKinds = {
  INMEMORY: "INMEMORY",
  // SQLITE: 'SQLITE',
} as const;

export const storageKindSchema = z.nativeEnum(StorageKinds);
export type StorageKind = z.infer<typeof storageKindSchema>;

export const BaseNowPlayingArgsSchema = z.object({
  storageKind: storageKindSchema.optional(),
  useCache: z.boolean().optional(),
  cacheDuration: z
    .number()
    .optional()
});
export type BaseNowPlayingArgs = z.infer<typeof BaseNowPlayingArgsSchema>;

export const SpotifyStreamerArgsSchema = z.object({
  clientId: z.string({
    message: "Spotify client ID (clientId) is required",
    required_error: "Spotify client ID (clientId) is required",
  }),
  clientSecret: z.string({
    message: "Spotify client secret (clientSecret) is required",
    required_error: "Spotify client secret (clientSecret) is required",
  }),
  refreshToken: z.string({
    message: "Spotify refresh token (refreshToken) is required",
    required_error: "Spotify refresh token (refreshToken) is required",
  }),
});
export type SpotifyStreamerArgs = z.infer<typeof SpotifyStreamerArgsSchema>;

export const SpotifyProviderArgsSchema = BaseNowPlayingArgsSchema.extend({
  streamerArgs: SpotifyStreamerArgsSchema,
});
export type SpotifyProviderArgs = z.infer<typeof SpotifyProviderArgsSchema>;

export const NoopProviderArgsSchema = BaseNowPlayingArgsSchema.extend({
  streamerArgs: z.unknown(),
});
export type NoopProviderArgs = z.infer<typeof NoopProviderArgsSchema>;
