import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";

import { Followers } from "./followers.ts";
import { Commander } from "./commander.ts";
import { Phases, Commands } from "./commands_phases.ts";
import { red } from "https://deno.land/std@0.66.0/fmt/colors.ts";
const clientId = Deno.env.get("CLIENT_ID") || "123",
  oauth = Deno.env.get("TWITCH_OAUTH") || "123";

const followers = new Followers(clientId, oauth);

await followers.fetchFollows();

const cli = async (): Promise<void> => {
  const tpr = new TextProtoReader(new BufReader(Deno.stdin));
  const cmder = new Commander(followers);
  while (true) {
    await Deno.stdout.write(encode(cmder.prefix));
    const line = await tpr.readLine();
    if (line === null || cmder.phase == Phases.normal && line === "exit") {
      cmder.exit();
      break;
    }
    if (line === "exit") {
      cmder.reset();
      continue;
    }
    if (line in Phases) {
      cmder.setPhase(line);
      continue;
    }
    if (line in Commands) {
      switch (line) {
        case Commands.show:
          cmder.showFollowers();
      }
      continue;
    }
    switch (cmder.phase) {
      case Phases.followers:
        const n = Number(line);
        if (isNaN(n)) {
          console.log(red("Must be a number"));
          continue;
        }
        const chan = followers.data.get(n)?.channel.name;
        if (!chan) continue;
        await cmder.runCmd(chan);
        break;
      case Phases.normal:
        await cmder.runCmd(line);
        break;
      default:
        console.log(`Default ran here =(`);
    }
  }
};
await cli();
