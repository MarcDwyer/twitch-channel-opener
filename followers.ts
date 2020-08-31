import { TwitchAPI } from "https://deno.land/x/tmi/mod.ts";
import {
  StreamData,
} from "https://deno.land/x/tmi@v0.0.7/lib/twitch_api_types.ts";
import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.65.0/async/deferred.ts";

export type FollowerMap = Map<number, StreamData>;
export class Followers {
  private api: TwitchAPI;
  private interval: number | null = null;

  data: FollowerMap = new Map();
  signal: Deferred<void> = deferred();

  constructor(clientId: string, oauth: string) {
    this.api = new TwitchAPI(clientId, oauth);
  }

  private async *followerGen() {
    while (true) {
      try {
        await this.signal;
        if (this.data && this.data.size) {
          for (const stream of this.data) {
            yield stream;
          }
        }
        this.signal = deferred();
      } catch (e) {
        console.log(e);
        if (this.interval) clearInterval(this.interval);
        break;
      }
    }
  }
  async fetchFollows() {
    try {
      const follows = await this.api.getFollowers();
      if (
        !follows.streams || !follows.streams.length
      ) {
        throw "No streams were found";
      }
      const m = new Map<number, StreamData>();
      for (let x = 0; x < follows.streams.length; x++) {
        const follow = follows.streams[x];
        m.set(x, follow);
      }
      this.data = m;
    } catch (e) {
      console.error(`Error setting new followers`);
    }
  }
  [Symbol.asyncIterator](): AsyncIterableIterator<[number, StreamData]> {
    this.fetchFollows().then(() => {
      this.interval = setInterval(() => this.fetchFollows(), 60000 * 5);
    });
    return this.followerGen();
  }
}
