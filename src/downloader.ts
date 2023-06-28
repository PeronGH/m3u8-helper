import { M3U8, parseM3U8, Segment } from "./parser.ts";
import { dirname } from "std/path/mod.ts";

export interface SegmentWithData extends Segment {
  data: Blob;
}

export interface M3U8WithData extends M3U8 {
  segments: SegmentWithData[];
}

function getURIList(segments: Segment[], baseURI: string): string[] {
  return segments.map((segment) => dirname(baseURI) + "/" + segment.uri);
}

export async function downloadSegments(
  segments: Segment[],
  baseURI: string,
  requestInit?: RequestInit,
): Promise<SegmentWithData[]> {
  const blobs = await Promise.all(
    getURIList(segments, baseURI).map((uri) =>
      fetch(uri, requestInit).then((response) => response.blob())
    ),
  );
  return blobs.map((blob, index) => ({
    ...segments[index],
    data: blob,
  }));
}

export async function downloadM3U8(
  url: string,
  requestInit?: RequestInit,
): Promise<M3U8WithData> {
  const response = await fetch(url, requestInit);
  const text = await response.text();
  const m3u8 = parseM3U8(text);
  const segments = await downloadSegments(m3u8.segments, url, requestInit);
  return {
    ...m3u8,
    segments,
  };
}
