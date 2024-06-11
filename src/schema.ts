import { z } from 'zod'

export const spotifyProviderSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  refreshToken: z.string(),
})
