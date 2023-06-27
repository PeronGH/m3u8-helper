import { Handler, serve } from "std/http/server.ts";
import { concatSegments, downloadM3U8 } from "./mod.ts";

const handler: Handler = async (req) => {
  try {
    const m3u8URL = req.url.slice(new URL(req.url).origin.length + 1);
    const m3u8 = await downloadM3U8(m3u8URL);
    const coactedBlob = concatSegments(m3u8.segments);
    return new Response(coactedBlob);
  } catch (error) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
};

await serve(handler, { port: 8080 });
