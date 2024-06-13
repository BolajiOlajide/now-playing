import { NowPlaying, Providers, StorageKinds } from "../src";

const np = new NowPlaying(Providers.NOOP, {
  storageKind: StorageKinds.INMEMORY,
  useCache: false,
  cacheDuration: 30000, // in milliseconds
});

console.log("Hello World", np);
