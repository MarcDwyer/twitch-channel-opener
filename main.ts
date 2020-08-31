import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";
import { green } from "https://deno.land/std/fmt/colors.ts";

import { Followers } from "./followers.ts";
import { Commands } from "./commands.ts";

const runCmd = async (channel: string) => {
  const url =
    `https://player.twitch.tv/?channel=${channel}&enableExtensions=false&muted=false&parent=twitch.tv&player=popout&volume=0.08
  `;
  const cmd = [
    "open",
    "-a",
    "Google Chrome",
    url,
  ];
  const p = Deno.run({
    cmd,
  });
  try {
    const s = await p.status();
    return s;
  } catch (err) {
    throw new Error("Error running comand");
  }
};
const clientId = Deno.env.get("CLIENT_ID") || "123",
  oauth = Deno.env.get("TWITCH_OAUTH") || "123";

const followers = new Followers(clientId, oauth);

const listen = async () => {
  for await (const follow of followers) {
    console.log(green(follow.channel.name));
  }
};

const cli = async (): Promise<void> => {
  const tpr = new TextProtoReader(new BufReader(Deno.stdin));
  while (true) {
    await Deno.stdout.write(encode("Command/Channel: "));
    const line = await tpr.readLine();
    if (line === null || line === Commands.exit) {
      console.log("exiting");
      followers.signal.reject("Program exiting...");
      break;
    }
    switch (line) {
      case Commands.followers:
        followers.signal.resolve();
        break;

      default:
        await runCmd(line);
    }
  }
};
listen();
await cli();
