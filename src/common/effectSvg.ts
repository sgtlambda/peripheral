import {Vector} from "matter-js";
import {FlameShape} from "./butaneFlame";

/**
 * Serialises effect shapes to standalone SVG documents.
 *
 * Both the explosion and the butane flame are pure vector effects, so a given
 * seed + time always produces the same geometry. These helpers turn that
 * geometry into an SVG string that can be written to disk and inspected in a
 * browser — no canvas or DOM required — which makes the effects testable
 * headlessly and reproducible.
 */

/** SVG path data (`d` attribute) for a closed polygon, translated by (cx, cy). */
function polygonPathD(points: Vector[], cx: number, cy: number): string {
  if (points.length === 0) return "";
  const cmds = points.map((p, i) =>
    `${i === 0 ? "M" : "L"}${(p.x + cx).toFixed(2)},${(p.y + cy).toFixed(2)}`,
  );
  return `${cmds.join(" ")} Z`;
}

function svgDocument(width: number, height: number, background: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n` +
    `  <rect width="${width}" height="${height}" fill="${background}"/>\n` +
    `${body}\n` +
    `</svg>\n`;
}

export type ExplosionSvgOptions = {
  width?: number;
  height?: number;
  fill?: string;
  background?: string;
};

/**
 * Renders explosion paths (main shape followed by holes) to an SVG string.
 *
 * The holes are expressed as extra subpaths on a single `fill-rule="evenodd"`
 * path, so they are subtracted from the main shape exactly as the game punches
 * them out — a faithful, browser-viewable picture of the "bitten" explosion.
 */
export function explosionSvg(paths: Vector[][], options: ExplosionSvgOptions = {}): string {
  const {
          width      = 500,
          height     = 500,
          fill       = "white",
          background  = "rgb(20,20,20)",
        } = options;

  const cx = width / 2;
  const cy = height / 2;

  const d = paths
    .filter(path => path.length > 0)
    .map(path => polygonPathD(path, cx, cy))
    .join(" ");

  const body = `  <path d="${d}" fill="${fill}" fill-rule="evenodd"/>`;
  return svgDocument(width, height, background, body);
}

export type FlameSvgOptions = {
  width?: number;
  height?: number;
  /** Solid flame colour */
  color?: string;
  background?: string;
  /** Nozzle position; defaults to bottom-centre so an upward flame fills the view */
  originX?: number;
  originY?: number;
};

/**
 * Renders a butane flame shape (body lenses minus growing hole lenses) to an SVG
 * string, in a single solid colour. The body/hole boolean subtraction is
 * expressed with an SVG `<mask>` (body drawn white = shown, holes drawn black =
 * hidden), which matches the `destination-out` compositing the canvas renderer
 * uses.
 */
export function flameSvg(shape: FlameShape, options: FlameSvgOptions = {}): string {
  const {
          width      = 500,
          height     = 500,
          color      = "rgb(120,170,255)",
          background  = "rgb(12,12,16)",
          originX    = width / 2,
          originY    = height - 70,
        } = options;

  const bodyPaths = shape.body
    .map(lens => `      <path d="${polygonPathD(lens, originX, originY)}" fill="white"/>`)
    .join("\n");
  const holePaths = shape.holes
    .map(lens => `      <path d="${polygonPathD(lens, originX, originY)}" fill="black"/>`)
    .join("\n");

  const body =
    `  <defs>\n` +
    `    <mask id="flameMask">\n` +
    `${bodyPaths}\n` +
    `${holePaths}\n` +
    `    </mask>\n` +
    `  </defs>\n` +
    `  <rect width="${width}" height="${height}" fill="${color}" mask="url(#flameMask)"/>`;

  return svgDocument(width, height, background, body);
}
