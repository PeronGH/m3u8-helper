import { groupBy } from "std/collections/group_by.ts";
import { slidingWindows } from "std/collections/sliding_windows.ts";
import { toLines } from "./utils.ts";

export interface M3U8 {
  version?: number;
  targetDuration?: number;
  mediaSequence?: number;
  segments: Segment[];
  isEnd: boolean;
}

export interface Segment {
  duration: number;
  uri: string;
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export function parseM3U8(textData: string): M3U8 {
  const lines = toLines(textData)
    .map((line) => line.trim())
    .filter((line) => line !== "");

  if (lines.at(0) !== "#EXTM3U") {
    throw new ParseError("Invalid m3u8 format");
  }

  const { metadataLines, segmentLines } = groupBy(
    lines.slice(1),
    (line) => line.startsWith("#EXT-X-") ? "metadataLines" : "segmentLines",
  );

  const metadata = metadataLines
    ? parseMetadata(metadataLines)
    : { isEnd: false };

  const segments = segmentLines ? parseSegments(segmentLines) : [];

  return { ...metadata, segments };
}

function parseMetadata(lines: string[]): Omit<M3U8, "segments"> {
  const metadata: Omit<M3U8, "segments"> = { isEnd: false };

  for (const line of lines) {
    const [key, value] = line.split(":");

    switch (key) {
      case "#EXT-X-VERSION":
        metadata.version = parseFloat(value);
        break;
      case "#EXT-X-TARGETDURATION":
        metadata.targetDuration = parseFloat(value);
        break;
      case "#EXT-X-MEDIA-SEQUENCE":
        metadata.mediaSequence = parseFloat(value);
        break;
      case "#EXT-X-ENDLIST":
        metadata.isEnd = true;
        break;
      default:
        throw new ParseError(`Unknown metadata: ${key}`);
    }
  }

  return metadata;
}

function parseSegments(lines: string[]): Segment[] {
  const segments: Segment[] = slidingWindows(lines, 2, { step: 2 })
    .map(([info, uri]) => {
      if (uri.startsWith("#")) {
        throw new ParseError(`Invalid segment uri: ${uri}`);
      }
      if (!info.startsWith("#EXTINF:")) {
        throw new ParseError(`Invalid segment info: ${info}`);
      }

      const duration = parseFloat(info.slice("#EXTINF:".length));

      return { duration, uri };
    });

  return segments;
}
