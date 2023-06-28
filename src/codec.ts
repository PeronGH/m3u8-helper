import { SegmentWithData } from "./downloader.ts";

export function concatSegments(segments: SegmentWithData[]) {
  return new Blob(segments.map((segment) => segment.data), {
    type: segments.at(0)?.data.type,
  });
}
