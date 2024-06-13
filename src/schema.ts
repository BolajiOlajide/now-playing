import * as z from "zod";

export const Providers = {
  SPOTIFY: "SPOTIFY",
  // this is mostly used for testing
  NOOP: "NOOP",
} as const;

export const providerSchema = z.nativeEnum(Providers);
export type Provider = z.infer<typeof providerSchema>;

export const StorageKinds = {
  INMEMORY: "INMEMORY",
  // SQLITE: 'SQLITE',
} as const;

export const storageKindSchema = z.nativeEnum(StorageKinds);
export type StorageKind = z.infer<typeof storageKindSchema>;

export const BaseNowPlayingArgsSchema = z.object({
  storageKind: storageKindSchema.optional().default(StorageKinds.INMEMORY),
  cacheSong: z.boolean().optional().default(true),
  cacheDuration: z
    .number()
    .optional()
    .default(60 * 60 * 24),
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
  streamerArgs: z.unknown().nullable().optional(),
});
export type NoopProviderArgs = z.infer<typeof NoopProviderArgsSchema>;
