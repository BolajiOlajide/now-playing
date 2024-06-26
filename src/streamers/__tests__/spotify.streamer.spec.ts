import {
  describe,
  test,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { type SpotifyAccessToken, SpotifyStreamer } from '../spotify.streamer'
import { InMemoryStorage } from '../../storage/inmemory.storage'
import { SPOTIFY_ACCESS_TOKEN_KEY, SPOTIFY_TRACK_KEY } from '../../constants'

const freshAccessToken = 'freshAccessToken'
const fetchAccessTokenHandler = http.post(
  'https://accounts.spotify.com/api/token',
  async ({ request }) => {
    const info = await request.formData()
    if (info.get('refresh_token') !== 'test-refresh-token') {
      return HttpResponse.json(
        {
          error: {
            message: 'something went wrong',
            status: 400,
          },
        },
        {
          status: 400,
          statusText: 'Bad Request',
          headers: {
            'content-type': 'application/json',
          },
        }
      )
    }
    return HttpResponse.json(
      {
        access_token: freshAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'user-read-email',
      },
      {
        status: 201,
        statusText: 'Created',
        headers: {
          'content-type': 'application/json',
        },
      }
    )
  }
)

const accessTokenForError = 'fake-access-token'
const accessTokenForNull = 'freshAccessToken null'
const lastPlayedSongHandler = http.get(
  'https://api.spotify.com/v1/me/player/recently-played',
  async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (authHeader === `Bearer ${accessTokenForError}`) {
      return HttpResponse.json(
        {
          error: {
            message: 'something went wrong',
            status: 400,
          },
        },
        {
          status: 400,
          statusText: 'Bad Request',
          headers: {
            'content-type': 'application/json',
          },
        }
      )
    } else if (authHeader === `Bearer ${accessTokenForNull}`) {
      return HttpResponse.json(
        {
          total: 0,
          items: [],
        },
        {
          status: 200,
          statusText: 'OK',
        }
      )
    }

    return HttpResponse.json(
      {
        total: 1,
        items: [
          {
            track: {
              name: 'Coming Home',
              artists: [{ name: 'Kanye West' }],
              external_urls: {
                spotify:
                  'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
              },
              album: {
                images: [
                  { url: 'https://i.scdn.co/image/ab67616d0000b273712549143' },
                ],
              },
              preview_url:
                'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
            },
          },
        ],
      },
      {
        status: 200,
        statusText: 'OK',
      }
    )
  }
)

const currPlayingaccessTokenForError = 'currPlayingaccessTokenForError'
const noCurrPlayingsongTOken = 'noCurrPlayingsongTOken'
const unauthenticatedToken = 'unauthenticatedToken'
const currentlyPlayingSongHandler = http.get('https://api.spotify.com/v1/me/player/currently-playing', async ({ request }) => {
  const authHeader = request.headers.get('Authorization')
    if (authHeader === `Bearer ${currPlayingaccessTokenForError}`) {
      return HttpResponse.json(
        {
          error: {
            message: 'something went wrong',
            status: 400,
          },
        },
        {
          status: 400,
          statusText: 'Bad Request',
        }
      )
    } else if (authHeader === `Bearer ${noCurrPlayingsongTOken}`) {
      return HttpResponse.json({
        is_playing: false,
      })
    } else if (authHeader === `Bearer ${unauthenticatedToken}`) {
      return HttpResponse.json({
        error: {
          status: 401,
          message: 'The access token expired',
        },
      }, {
        status: 401,
        statusText: 'Unauthorized',
      })
    }
    return HttpResponse.json({
      is_playing: true,
      currently_playing_type: 'track',
      item: {
        name: 'Kolwa',
        artists: [
          { name: 'Euggy' },
          { name: 'Suraj' },
          { name: 'Mumba Yachi' },
        ],
        external_urls: {
          spotify: 'https://open.spotify.com/track/4U6zIONOpmnby5fvOM6han?si=a7661613c3fa46c3',
        },
        album: {
          images: [
            {
              url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
            },
          ],
        },
        preview_url: 'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
      }
    })
})

describe('SpotifyStreamer', () => {
  const storer = new InMemoryStorage()
  const clientId = 'test-client-id'
  const clientSecret = 'test-client-secret'
  const refreshToken = 'test-refresh-token'
  const useCache = true
  const cacheDuration = 3600

  const server = setupServer(fetchAccessTokenHandler, lastPlayedSongHandler, currentlyPlayingSongHandler)
  beforeAll(() => {
    // Start the interception.
    server.listen({
      // This tells MSW to throw an error whenever it
      // encounters a request that doesn't have a
      // matching request handler.
      onUnhandledRequest: 'error',
    })
  })

  afterEach(() => {
    // Remove any handlers you may have added
    // in individual tests (runtime handlers).
    server.resetHandlers()
  })

  afterAll(() => {
    // Disable request interception and clean up.
    server.close()
  })

  describe('getAccessToken()', () => {
    const streamer = new SpotifyStreamer(storer, {
      clientId,
      clientSecret,
      refreshToken,
      useCache,
      cacheDuration,
    })

    beforeEach(() => {
      storer.clear()
    })

    test('fetch from cache if available', async () => {
      const fakeAccessToken = "bolaji's fake access token"
      const payload = { access_token: fakeAccessToken }
      storer.set(SPOTIFY_ACCESS_TOKEN_KEY, payload, 5000)
      const response = await streamer.getAccessToken(refreshToken)
      expect(response.access_token).toBe(fakeAccessToken)
    })

    test('fetch from spotify if not available in cache (and save in cache afterwards', async () => {
      const response = await streamer.getAccessToken(refreshToken)
      expect(response.access_token).toBe(freshAccessToken)

      const storedToken = storer.get<SpotifyAccessToken>(
        SPOTIFY_ACCESS_TOKEN_KEY
      )
      expect(storedToken).toEqual(response)
    })

    test('throw error if token fetching is unsuccessful', async () => {
      expect.assertions(1)
      return streamer.getAccessToken('fake-refresh-token').catch((error) => {
        expect(error).toEqual({
           message: 'something went wrong', status: 400
        })
      })
    })
  })

  describe('fetchLastPlayed()', () => {
    const streamer = new SpotifyStreamer(storer, {
      clientId,
      clientSecret,
      refreshToken,
      useCache,
      cacheDuration,
    })

    beforeEach(() => {
      streamer.setUseCache(true)
      storer.clear()
    })

    beforeAll(() => {
      const fakeAccessToken = "bolaji's fake access token"
      const payload = { access_token: fakeAccessToken }
      storer.set(SPOTIFY_ACCESS_TOKEN_KEY, payload, 5000)
    })
    afterAll(() => {
      streamer.setUseCache(true)
    })

    test('should return an error if http request errors', async () => {
      expect.assertions(1)
      return streamer
        .fetchLastPlayed({
          access_token: accessTokenForError,
        } as SpotifyAccessToken)
        .catch((error) => {
          expect(error).toEqual({
             message: 'something went wrong', status: 400
          })
        })
    })

    test('should return null if endpoint doesnt contain item', async () => {
      const response = await streamer.fetchLastPlayed({
        access_token: accessTokenForNull,
      } as SpotifyAccessToken)
      expect(response).toBeNull()
    })

    test('should return the last played song and not cache if useCache is false', async () => {
      streamer.setUseCache(false)
      const response = await streamer.fetchLastPlayed({
        access_token: freshAccessToken,
      } as SpotifyAccessToken)
      const cachedSong = storer.get(SPOTIFY_TRACK_KEY)
      expect(cachedSong).toBeUndefined()
      expect(response).toEqual({
        is_playing: false,
        title: 'Coming Home',
        artiste: 'Kanye West',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
        preview_url:
          'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
        url: 'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
      })
    })

    test('should return the last played song and cache if useCache is true', async () => {
      const response = await streamer.fetchLastPlayed({
        access_token: freshAccessToken,
      } as SpotifyAccessToken)
      const cachedSong = storer.get(SPOTIFY_TRACK_KEY)
      expect(cachedSong).toEqual(response)
      expect(response).toEqual({
        is_playing: false,
        title: 'Coming Home',
        artiste: 'Kanye West',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
        preview_url:
          'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
        url: 'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
      })
    })
  })

  describe('fetchCurrentlyPlaying', () => {
    const streamer = new SpotifyStreamer(storer, {
      clientId,
      clientSecret,
      refreshToken,
      useCache,
      cacheDuration,
    })

    beforeEach(() => {
      streamer.setUseCache(true)
      storer.clear()
    })

    beforeAll(() => {
      const fakeAccessToken = "bolaji's fake access token"
      storer.set(SPOTIFY_ACCESS_TOKEN_KEY, { access_token: fakeAccessToken }, 5000)
    })
    afterAll(() => {
      streamer.setUseCache(true)
    })

    const songResult = {
      title: 'Kolwa',
      artiste: 'Euggy, Suraj, Mumba Yachi',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
      is_playing: true,
      preview_url: 'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
      url: 'https://open.spotify.com/track/4U6zIONOpmnby5fvOM6han?si=a7661613c3fa46c3'
    }
    test('should fetch track from cache if it exists', async () => {
      storer.set(SPOTIFY_TRACK_KEY, songResult, 5000)
      const response = await streamer.fetchCurrentlyPlaying()
      expect(response).toEqual(songResult)
    })

    test('should fetch new token and make request again if endpoint returns 401', async () => {
      storer.set(SPOTIFY_ACCESS_TOKEN_KEY, { access_token: unauthenticatedToken, expires_in: 3000 }, 5000)
      const response = await streamer.fetchCurrentlyPlaying()
      expect(response).toEqual(songResult)

      const cachedSong = storer.get(SPOTIFY_TRACK_KEY)
      expect(cachedSong).toEqual(response)
    })

    test('should not save in cache if useCache is false', async () => {
      streamer.setUseCache(false)
      storer.set(SPOTIFY_ACCESS_TOKEN_KEY, { access_token: unauthenticatedToken, expires_in: 3000 }, 5000)

      const response = await streamer.fetchCurrentlyPlaying()
      expect(response).toEqual(songResult)

      const cachedSong = storer.get(SPOTIFY_TRACK_KEY)
      expect(cachedSong).toBeUndefined()
    })

    test('should fetch last played song if response is not ok', async () => {
      storer.set(SPOTIFY_ACCESS_TOKEN_KEY, { access_token: currPlayingaccessTokenForError, expires_in: 3000 }, 5000)
      const response = await streamer.fetchCurrentlyPlaying()
      expect(response).toEqual({
        is_playing: false,
        title: 'Coming Home',
        artiste: 'Kanye West',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
        preview_url:
          'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
        url: 'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
      })

      const cachedSong = storer.get(SPOTIFY_TRACK_KEY)
      expect(cachedSong).toEqual({
        is_playing: false,
        title: 'Coming Home',
        artiste: 'Kanye West',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
        preview_url:
          'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
        url: 'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
      })
    })

    test('should fetch last played song if no track is currently playing', async () => {
      storer.set(SPOTIFY_ACCESS_TOKEN_KEY, { access_token: noCurrPlayingsongTOken, expires_in: 3000 }, 5000)
      const response = await streamer.fetchCurrentlyPlaying()
      expect(response).toEqual({
        is_playing: false,
        title: 'Coming Home',
        artiste: 'Kanye West',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
        preview_url:
          'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
        url: 'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
      })

      const cachedSong = storer.get(SPOTIFY_TRACK_KEY)
      expect(cachedSong).toEqual({
        is_playing: false,
        title: 'Coming Home',
        artiste: 'Kanye West',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
        preview_url:
          'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
        url: 'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
      })
    })

    test('should return currently playing song', async () => {
      storer.set(SPOTIFY_ACCESS_TOKEN_KEY, { access_token: freshAccessToken, expires_in: 3000 }, 5000)
      const response = await streamer.fetchCurrentlyPlaying()
      expect(response).toEqual(songResult)
    })
  })
})
