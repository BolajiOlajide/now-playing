import { NowPlaying, Providers, StorageKinds } from "../src";

const np = new NowPlaying(Providers.SPOTIFY, {
  storageKind: StorageKinds.INMEMORY,
  useCache: false,
  cacheDuration: 30000, // in milliseconds
  streamerArgs: {
    clientId: "foo",
    clientSecret: "bar",
    refreshToken: "baz",
  }
});

console.log("Hello World", np);
