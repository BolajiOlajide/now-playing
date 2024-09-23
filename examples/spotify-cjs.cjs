const { NowPlaying, Providers } = require('@BolajiOlajide/now-playing')

const np = new NowPlaying(Providers.SPOTIFY, {
  streamerArgs: {
    clientId: 'foo',
    clientSecret: 'bar',
    refreshToken: 'baz',
  },
})

console.log('Hello World from CJS', np)
