// Under static export, Next hands the page component the percent-encoded form
// of a non-ASCII dynamic segment ("f%C3%A9vrier") while generateMetadata gets
// the decoded one ("février"). A raw lookup then misses, and the page ships a
// 200 holding the not-found body (soft 404) under a correct title.
// Decode before every lookup; a malformed escape falls back to the raw value.
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
