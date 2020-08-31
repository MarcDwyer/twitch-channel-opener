import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";
import { green } from "https://deno.land/std/fmt/colors.ts";

import { Followers } from "./followers.ts";
import { Commands } from "./commands.ts";
import { CommandPhase, Phases } from "./cli_phase.ts";

const clientId = Deno.env.get("CLIENT_ID") || "123",
  oauth = Deno.env.get("TWITCH_OAUTH") || "123";

const followers = new Followers(clientId, oauth);

const listen = async () => {
  for await (const [num, stream] of followers) {
    console.log(green(`[${num}]: ${stream.channel.name}`));
  }
};

const cli = async (): Promise<void> => {
  const tpr = new TextProtoReader(new BufReader(Deno.stdin));
  const cmder = new CommandPhase();
  while (true) {
    await Deno.stdout.write(encode(cmder.prefix));
    const line = await tpr.readLine();
    if (line === null || line === "exit") {
      followers.signal.reject("Program exiting...");
      break;
    }
    if (line[0] === "!") {
      cmder.setStatus(line.substring(1, line.length));
      followers.signal.resolve();
      continue;
    }
    switch (cmder.phase) {
      case Phases.followers:
        const n = Number(line);
        if (isNaN(n)) continue;
        await cmder.runCmd(followers.data.get(n)?.channel.name || "lcs");
        break;
      case Phases.normal:
        await cmder.runCmd(line);
        break;
      default:
        console.log(`Default ran here =(`);
    }
  }
};
listen();
await cli();
