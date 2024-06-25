import { describe, test, expect, vi } from 'vitest'

import { SpotifyStreamer } from '../spotify.streamer'
import { InMemoryStorage } from '../../storage/inmemory.storage'
import { SPOTIFY_ACCESS_TOKEN_KEY, SPOTIFY_TRACK_KEY } from '../../constants'

describe('SpotifyStreamer', () => {
    const storer = new InMemoryStorage()
    const clientId = 'test-client-id'
    const clientSecret = 'test-client-secret'
    const refreshToken = 'test-refresh-token'
    const useCache = true
    const cacheDuration = 3600

    const streamer = new SpotifyStreamer(storer, {
        clientId,
        clientSecret,
        refreshToken,
        useCache,
        cacheDuration,
    })

    const fetchJSONResult = {
        headers: new Headers(),
        redirected: false,
        statusText: '',
        type: 'basic',
        url: '',
        clone: function (): Response {
            throw new Error('Function not implemented.')
        },
        body: null,
        bodyUsed: false,
        arrayBuffer: function (): Promise<ArrayBuffer> {
            throw new Error('Function not implemented.')
        },
        blob: function (): Promise<Blob> {
            throw new Error('Function not implemented.')
        },
        formData: function (): Promise<FormData> {
            throw new Error('Function not implemented.')
        },
        json: function (): Promise<any> {
            throw new Error('Function not implemented.')
        },
        text: function (): Promise<string> {
            throw new Error('Function not implemented.')
        },
    }

    test('should fetch access token', async () => {
        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ...fetchJSONResult,
            // headers: new Headers({
            //   'content-type': 'application/json',
            // }),
            json: vi.fn().mockResolvedValue({
                access_token: 'test-access-token',
                token_type: 'Bearer',
                expires_in: 3600,
                scope: 'test-scope',
                created_at: Date.now(),
            }),
            status: 200,
            ok: true,
        })

        const accessToken = await streamer.getAccessToken(refreshToken)

        expect(fetchMock).toHaveBeenCalledWith(
            'https://accounts.spotify.com/api/token',
            {
                method: 'POST',
                headers: {
                    Authorization: expect.any(String),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: expect.any(URLSearchParams),
            }
        )
        expect(accessToken).toHaveProperty('access_token', 'test-access-token')
        expect(storer.get(SPOTIFY_ACCESS_TOKEN_KEY)).toEqual(accessToken)

        fetchMock.mockRestore()
    })

    test('should fetch currently playing song', async () => {
        const accessToken = {
            access_token: 'test-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'test-scope',
            created_at: Date.now(),
        }
        storer.set(
            SPOTIFY_ACCESS_TOKEN_KEY,
            accessToken,
            accessToken.expires_in - 1000
        )

        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue({
                is_playing: true,
                currently_playing_type: 'track',
                item: {
                    name: 'Test Song',
                    artists: [{ name: 'Test Artist' }],
                    external_urls: {
                        spotify: 'https://open.spotify.com/track/test-track-id',
                    },
                    album: {
                        images: [{ url: 'https://example.com/album-art.jpg' }],
                    },
                    preview_url: 'https://example.com/preview.mp3',
                },
            }),
            status: 200,
            ok: true,
        })

        const song = await streamer.fetchCurrentlyPlaying()

        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/currently-playing',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken.access_token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        )
        expect(song).toEqual({
            is_playing: true,
            title: 'Test Song',
            artiste: 'Test Artist',
            image_url: 'https://example.com/album-art.jpg',
            preview_url: 'https://example.com/preview.mp3',
            url: 'https://open.spotify.com/track/test-track-id',
        })
        expect(storer.get(SPOTIFY_TRACK_KEY)).toEqual(song)

        fetchMock.mockRestore()
    })

    test('should fetch last played song when currently playing is not available', async () => {
        const accessToken = {
            access_token: 'test-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'test-scope',
            created_at: Date.now(),
        }
        storer.set(
            SPOTIFY_ACCESS_TOKEN_KEY,
            accessToken,
            accessToken.expires_in - 1000
        )

        const fetchMock = vi
            .spyOn(global, 'fetch')
            .mockResolvedValueOnce({ status: 204, ok: false })
            .mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue({
                    total: 1,
                    items: [
                        {
                            track: {
                                name: 'Last Played Song',
                                artists: [{ name: 'Last Played Artist' }],
                                external_urls: {
                                    spotify:
                                        'https://open.spotify.com/track/last-played-track-id',
                                },
                                album: {
                                    images: [
                                        {
                                            url: 'https://example.com/last-played-album-art.jpg',
                                        },
                                    ],
                                },
                                preview_url:
                                    'https://example.com/last-played-preview.mp3',
                            },
                        },
                    ],
                }),
                status: 200,
                ok: true,
            })

        const song = await streamer.fetchCurrentlyPlaying()

        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/currently-playing',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken.access_token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        )
        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/recently-played?limit=1',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken.access_token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        )
        expect(song).toEqual({
            is_playing: false,
            title: 'Last Played Song',
            artiste: 'Last Played Artist',
            image_url: 'https://example.com/last-played-album-art.jpg',
            preview_url: 'https://example.com/last-played-preview.mp3',
            url: 'https://open.spotify.com/track/last-played-track-id',
        })
        expect(storer.get(SPOTIFY_TRACK_KEY)).toEqual(song)

        fetchMock.mockRestore()
    })

    test('should return null when no recently played song is available', async () => {
        const accessToken = {
            access_token: 'test-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'test-scope',
            created_at: Date.now(),
        }
        storer.set(
            SPOTIFY_ACCESS_TOKEN_KEY,
            accessToken,
            accessToken.expires_in - 1000
        )

        const fetchMock = vi
            .spyOn(global, 'fetch')
            .mockResolvedValueOnce({
                status: 204,
                ok: false,
            })
            .mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue({ total: 0, items: [] }),
                status: 200,
                ok: true,
            })

        const song = await streamer.fetchCurrentlyPlaying()

        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/currently-playing',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken.access_token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        )
        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/recently-played?limit=1',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken.access_token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        )
        expect(song).toBeNull()
        expect(storer.get(SPOTIFY_TRACK_KEY)).toBeUndefined()

        fetchMock.mockRestore()
    })
})
