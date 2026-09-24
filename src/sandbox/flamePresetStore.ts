import {FlamePreset, parsePresets, serializePresets} from "../common/flamePresets";

/** Dev-server endpoint backed by `data/flamePresets.csv` (see vite.config.js). */
const ENDPOINT = "/api/flame-presets";

/** Read the whole preset database. */
export async function loadPresets(): Promise<FlamePreset[]> {
  const response = await fetch(ENDPOINT);
  if (!response.ok) throw new Error(`preset store: GET failed (${response.status})`);
  return parsePresets(await response.text());
}

/**
 * Write the whole preset database. The playground keeps the full list in
 * memory, so every mutation rewrites the file — fine for one editor, but two
 * tabs editing at once would clobber each other.
 */
export async function savePresets(presets: FlamePreset[]): Promise<void> {
  const response = await fetch(ENDPOINT, {
    method:  "PUT",
    headers: {"Content-Type": "text/csv"},
    body:    serializePresets(presets),
  });
  if (!response.ok) throw new Error(`preset store: PUT failed (${response.status})`);
}
