import type { Song, IStreamer } from './types'
import { SpotifyStreamerArgsSchema, type SpotifyStreamerArgs } from '../schema'
import type { IStorer } from '../storage'
import { SPOTIFY_ACCESS_TOKEN_KEY } from '../constants'

interface SpotifyAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
}

type SpotifyTrack = {
  name: string;
  artists: Array<{ name: string }>;
  external_urls: { spotify: string };
  album: { images: Array<{ url: string }> };
  preview_url: string;
}

type SpotifyCurrrentlyPlayingResponse = {
  is_playing: boolean;
  currently_playing_type: string;
  item: SpotifyTrack
}

type SpotifyRecentlyPlayedResponse = {
  total: number;
  items: Array<{ track: SpotifyTrack }>
}

export class SpotifyStreamer implements IStreamer {
  private clientId: string
  private clientSecret: string
  private refreshToken: string
  private storer: IStorer

  constructor(storer: IStorer, args: SpotifyStreamerArgs) {
    this.storer = storer
    SpotifyStreamerArgsSchema.parse(args)

    this.clientId = args.clientId
    this.clientSecret = args.clientSecret
    this.refreshToken = args.refreshToken
  }

  public async getAccessToken(refreshToken: string, forceRefresh: boolean=false): Promise<SpotifyAccessToken> {
    const existingAccessToken = this.storer.get<SpotifyAccessToken>(SPOTIFY_ACCESS_TOKEN_KEY)

    if (!forceRefresh && existingAccessToken && (existingAccessToken.created_at + existingAccessToken.expires_in > Date.now())) {
      return existingAccessToken;
    }

    const tempToken = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const headers = { Authorization: `Basic ${tempToken}`, 'Content-Type': 'application/x-www-form-urlencoded' };

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers, body: params });
    const jsonData = await response.json() as SpotifyAccessToken;
    jsonData.created_at = Date.now()
    this.storer.set(SPOTIFY_ACCESS_TOKEN_KEY, jsonData)
    return jsonData
  }

  async fetchCurrentlyPlaying(): Promise<Song | null> {
    let accessToken = await this.getAccessToken(this.refreshToken)

    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Accept: 'application/json' };
    let response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { method: 'GET', headers });

    if (response.status === 401) {
      accessToken = await this.getAccessToken(this.refreshToken, true);
      headers.Authorization = `Bearer ${accessToken.access_token}`;
      response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { method: 'GET', headers });
    }

    if (response.status === 204 || !response.ok) {
      return this.fetchLastPlayed(accessToken);
    }

    const jsonData = await response.json() as SpotifyCurrrentlyPlayingResponse;

    if (!jsonData.is_playing || jsonData.currently_playing_type!== 'track') {
      return this.fetchLastPlayed(accessToken)
    }

    const track = jsonData.item
    return {
      is_playing: jsonData.is_playing,
      title: track.name,
      artiste: track.artists.map(artist => artist.name).join(', '),
      image_url: track.album.images[0].url,
      preview_url: track.preview_url,
      url: track.external_urls.spotify,
    }
  }

  private async fetchLastPlayed(accessToken: SpotifyAccessToken): Promise<Song | null> {
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Accept: 'application/json' };
    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { method: 'GET', headers });
    const jsonData = await response.json() as SpotifyRecentlyPlayedResponse;

    if (jsonData.items.length === 0) {
      return null
    }

    const [{ track: lastPlayedTrack }] = jsonData.items
    return {
      is_playing: false,
      title: lastPlayedTrack.name,
      artiste: lastPlayedTrack.artists.map(artist => artist.name).join(', '),
      image_url: lastPlayedTrack.album.images[0].url,
      preview_url: lastPlayedTrack.preview_url,
      url: lastPlayedTrack.external_urls.spotify,
    }
  }
}
