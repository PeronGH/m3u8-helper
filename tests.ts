import { concatSegments, downloadM3U8 } from "./mod.ts";

const url = prompt("URL:")!;

const m3u8 = await downloadM3U8(url);

console.log(m3u8);

const finalFile = concatSegments(m3u8.segments);

console.log(finalFile);

Deno.writeFile("final.ts", finalFile.stream());
