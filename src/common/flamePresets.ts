import {FlameParams, flameDefaults} from "./flame";
import {EasingName, easingNames} from "./easings";

/**
 * A named flame preset with a *complete* parameter set — unlike
 * `FlameTemplate`, which only carries the overrides that differ from the
 * defaults. Presets are the rows of the playground's CSV database, so every
 * column is always present and directly comparable across rows (which is the
 * point: the whole table can be loaded into a spreadsheet or a notebook and
 * analysed as-is).
 */
export type FlamePreset = {
  name: string;
  color: string;
  config: FlameParams;
};

/** Parameter keys, in a stable order — these become the CSV columns after `name`/`color`. */
export const PRESET_PARAM_KEYS = Object.keys(flameDefaults) as (keyof FlameParams)[];

/** Full CSV header, in file order. */
export const PRESET_COLUMNS = ["name", "color", ...PRESET_PARAM_KEYS];

/** Quote a CSV field if it contains a comma, quote or newline (colours do: `rgb(1,2,3)`). */
function encodeField(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Parse one CSV line into raw fields, honouring double-quoted fields and `""` escapes. */
function parseLine(line: string): string[] {
  const fields: string[] = [];
  let field  = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {field += '"'; i++;}
        else quoted = false;
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      fields.push(field);
      field = "";
    } else field += c;
  }
  fields.push(field);
  return fields;
}

/** Coerce a raw CSV cell to the type its default value has, falling back to that default. */
function decodeValue(key: keyof FlameParams, raw: string): number | boolean | EasingName {
  const fallback = flameDefaults[key];
  const value    = raw.trim();
  if (value === "") return fallback;
  if (typeof fallback === "boolean") return value === "true" || value === "1";
  if (typeof fallback === "number") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return (easingNames as readonly string[]).includes(value) ? value as EasingName : fallback;
}

/** Serialise presets to the CSV text of the whole database (header included). */
export function serializePresets(presets: FlamePreset[]): string {
  const rows = presets.map(preset => [
    preset.name,
    preset.color,
    ...PRESET_PARAM_KEYS.map(key => String(preset.config[key])),
  ].map(encodeField).join(","));
  return [PRESET_COLUMNS.join(","), ...rows].join("\n") + "\n";
}

/**
 * Parse the CSV database back into presets. Columns are matched by header name
 * (not position), and any parameter the file doesn't have falls back to its
 * default — so presets written before a new parameter existed keep loading.
 */
export function parsePresets(csv: string): FlamePreset[] {
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length === 0) return [];

  const header = parseLine(lines[0]);
  const indexOf = (column: string) => header.indexOf(column);

  return lines.slice(1).map(line => {
    const fields = parseLine(line);
    const at     = (column: string) => {
      const i = indexOf(column);
      return i >= 0 && i < fields.length ? fields[i] : "";
    };
    const config = {...flameDefaults};
    PRESET_PARAM_KEYS.forEach(key => {
      (config as Record<string, unknown>)[key] = decodeValue(key, at(key));
    });
    return {name: at("name"), color: at("color") || "rgb(255,255,255)", config};
  }).filter(preset => preset.name !== "");
}
