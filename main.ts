import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";

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

const cli = async (): Promise<void> => {
  const tpr = new TextProtoReader(new BufReader(Deno.stdin));
  while (true) {
    await Deno.stdout.write(encode("Channel Name: "));
    const line = await tpr.readLine();
    if (line === null || line === "close") {
      break;
    }
    await runCmd(line);
  }
};

await cli();
