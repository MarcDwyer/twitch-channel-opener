import { TwitchAPI } from "https://deno.land/x/tmi/mod.ts";
import {
  V5StreamersPayload,
  StreamData,
} from "https://deno.land/x/tmi@v0.0.7/lib/twitch_api_types.ts";
import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.65.0/async/deferred.ts";

export class Followers {
  private api: TwitchAPI;
  private followers: null | V5StreamersPayload = null;
  private interval: number | null = null;

  signal: Deferred<void> = deferred();

  constructor(clientId: string, oauth: string) {
    this.api = new TwitchAPI(clientId, oauth);
  }

  private async *followerGen() {
    while (true) {
      try {
        await this.signal;
        if (this.followers && this.followers.streams) {
          for (const stream of this.followers.streams) {
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
  [Symbol.asyncIterator](): AsyncIterableIterator<StreamData> {
    this.api.getFollowers().then((data) => {
      this.followers = data;
      this.interval = setInterval(() => {
        this.api.getFollowers().then((data) => {
          this.followers = data;
        });
      }, 60000 * 5);
    });
    return this.followerGen();
  }
}
