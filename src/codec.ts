import { SegmentWithData } from "./downloader.ts";
import { mergeReadableStreams } from "std/streams/merge_readable_streams.ts";

export function concatSegments(segments: SegmentWithData[]) {
  return mergeReadableStreams(...segments.map((segment) => segment.data));
}
