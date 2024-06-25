import { NowPlaying, Providers } from '../dist'

const np = new NowPlaying(Providers.SPOTIFY, {
    streamerArgs: {
        clientId: 'foo',
        clientSecret: 'bar',
        refreshToken: 'baz',
    },
})

console.log('Hello World', np)
