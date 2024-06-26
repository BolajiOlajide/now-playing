import fetch, { Response } from 'node-fetch'

import type { Song, IStreamer, IStreamerCacheOpts } from './types'
import { SpotifyStreamerArgsSchema, type SpotifyStreamerArgs } from '../schema'
import type { IStorer } from '../storage'
import { SPOTIFY_ACCESS_TOKEN_KEY, SPOTIFY_TRACK_KEY } from '../constants'

export interface SpotifyAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface SpotifyErrorResponse {
  error: SpotifyError
}

interface SpotifyError {
  status: number
  message: string
}

export interface SpotifyTrack {
  name: string
  artists: Array<{ name: string }>
  external_urls: { spotify: string }
  album: { images: Array<{ url: string }> }
  preview_url: string
}

type SpotifyCurrrentlyPlayingResponse = {
  is_playing: boolean
  currently_playing_type: string
  item: SpotifyTrack
}

type SpotifyRecentlyPlayedResponse = {
  total: number
  items: Array<{ track: SpotifyTrack }>
}

export class SpotifyStreamer implements IStreamer {
  private clientId: string
  private clientSecret: string
  private refreshToken: string
  private storer: IStorer
  private useCache: boolean
  private cacheDuration: number

  constructor(storer: IStorer, args: SpotifyStreamerArgs & IStreamerCacheOpts) {
    this.storer = storer
    SpotifyStreamerArgsSchema.parse(args)

    this.clientId = args.clientId
    this.clientSecret = args.clientSecret
    this.refreshToken = args.refreshToken
    this.useCache = args.useCache
    this.cacheDuration = args.cacheDuration
  }

  public async getAccessToken(
    refreshToken: string,
    forceRefresh: boolean = false
  ): Promise<SpotifyAccessToken> {
    const existingAccessToken = this.storer.get<SpotifyAccessToken>(
      SPOTIFY_ACCESS_TOKEN_KEY
    )

    if (!forceRefresh && existingAccessToken) {
      return existingAccessToken
    }

    const tempToken = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64')
    const headers = {
      Authorization: `Basic ${tempToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    const params = new URLSearchParams()
    params.append('grant_type', 'refresh_token')
    params.append('refresh_token', refreshToken)

    const response: Response = await fetch(
      'https://accounts.spotify.com/api/token',
      { method: 'POST', headers, body: params }
    )
    if (!response.ok) {
      const errorInfo = (await response.json()) as SpotifyErrorResponse
      return Promise.reject(errorInfo.error)
    }
    const jsonData = (await response.json()) as SpotifyAccessToken
    this.storer.set(
      SPOTIFY_ACCESS_TOKEN_KEY,
      jsonData,
      jsonData.expires_in - 1000
    )
    return jsonData
  }

  public async fetchCurrentlyPlaying(): Promise<Song | null> {
    if (this.useCache) {
      const cachedSong = this.storer.get<Song>(SPOTIFY_TRACK_KEY)

      if (cachedSong) {
        return cachedSong
      }
    }

    let accessToken = await this.getAccessToken(this.refreshToken)

    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    let response: Response = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      { method: 'GET', headers }
    )

    if (response.status === 401) {
      accessToken = await this.getAccessToken(this.refreshToken, true)
      headers.Authorization = `Bearer ${accessToken.access_token}`
      response = await fetch(
        'https://api.spotify.com/v1/me/player/currently-playing',
        { method: 'GET', headers }
      )
    }

    if (response.status === 204 || !response.ok) {
      return this.fetchLastPlayed(accessToken)
    }

    const jsonData = (await response.json()) as SpotifyCurrrentlyPlayingResponse

    if (!jsonData.is_playing || jsonData.currently_playing_type !== 'track') {
      return this.fetchLastPlayed(accessToken)
    }

    const track = jsonData.item

    const song: Song = {
      is_playing: jsonData.is_playing,
      title: track.name,
      artiste: track.artists.map((artist) => artist.name).join(', '),
      image_url: track.album.images[0].url,
      preview_url: track.preview_url,
      url: track.external_urls.spotify,
    }

    if (this.useCache) {
      this.storer.set(SPOTIFY_TRACK_KEY, song, this.cacheDuration)
    }
    return song
  }

  async fetchLastPlayed(accessToken: SpotifyAccessToken): Promise<Song | null> {
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    const response: Response = await fetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=1',
      { method: 'GET', headers }
    )
    if (!response.ok) {
      const errorInfo = (await response.json()) as SpotifyErrorResponse
      return Promise.reject(errorInfo.error)
    }
    const jsonData = (await response.json()) as SpotifyRecentlyPlayedResponse

    if (jsonData.items.length === 0 || jsonData.total === 0) {
      return null
    }

    const [{ track: lastPlayedTrack }] = jsonData.items
    const lastPlayed = {
      is_playing: false,
      title: lastPlayedTrack.name,
      artiste: lastPlayedTrack.artists.map((artist) => artist.name).join(', '),
      image_url: lastPlayedTrack.album.images[0].url,
      preview_url: lastPlayedTrack.preview_url,
      url: lastPlayedTrack.external_urls.spotify,
    }

    if (this.useCache) {
      this.storer.set(SPOTIFY_TRACK_KEY, lastPlayed, this.cacheDuration)
    }

    return lastPlayed
  }

  setUseCache(useCache: boolean): void {
    this.useCache = useCache
  }
}
