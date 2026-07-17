/**
 * Render a procedural effect to an SVG file at a given seed and time.
 *
 * The effects (explosion, butane flame) are pure vector generators, so a seed +
 * time fully determines the shape. This makes them reproducible and inspectable
 * without launching the game: dump a frame to SVG and open it in a browser.
 *
 * Usage:
 *   npx tsx scripts/renderEffect.ts explosion --seed 3 --t 0.65 --out expl.svg
 *   npx tsx scripts/renderEffect.ts flame --seed 1 --t 0.4 --out flame.svg
 *
 * Options (all optional except the effect name):
 *   --seed <n>    RNG seed (default: 1)
 *   --t <n>       Time: explosion 0..1, flame in seconds (default: 0.6 / 0.3)
 *   --out <file>  Output path (default: <effect>.svg)
 *   --size <n>    Canvas size in px (default: 500)
 */

import {writeFileSync} from "fs";
import {Rng} from "../src/common/Rng";
import {generateAnimatedExplosion} from "../src/common/explosion";
import {generateAnimatedFlame} from "../src/common/butaneFlame";
import {explosionSvg, flameSvg} from "../src/common/effectSvg";
import {colorTupleToRgba, getGradientColor} from "../src/common/colorGradient";
import {fire} from "../src/gradients";
import {flameTemplates} from "../src/common/flameTemplates";

function parseArgs(argv: string[]) {
  const [effect, ...rest] = argv;
  const opts: Record<string, string> = {};
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i]?.replace(/^--/, "");
    if (key) opts[key] = rest[i + 1];
  }
  return {effect, opts};
}

const {effect, opts} = parseArgs(process.argv.slice(2));

const seed = opts.seed !== undefined ? Number(opts.seed) : 1;
const size = opts.size !== undefined ? Number(opts.size) : 500;
const rng  = new Rng(seed);

const out = opts.out ?? `${effect}.svg`;

function renderSvg(): string {
  if (effect === "explosion") {
    const t   = opts.t !== undefined ? Number(opts.t) : 0.6;
    const gen = generateAnimatedExplosion({radius: size * 0.2, gapCount: 12, random: rng.next});
    return explosionSvg(gen.generate(t), {
      width:  size,
      height: size,
      fill:   colorTupleToRgba(getGradientColor(fire, t)),
    });
  }
  if (effect === "flame") {
    const t     = opts.t !== undefined ? Number(opts.t) : 0.3;
    const reach = size * 0.48;
    const tpl   = opts.template
      ? flameTemplates.find(x => x.name.toLowerCase() === opts.template.toLowerCase())
      : undefined;
    if (opts.template && !tpl) {
      console.error(`Unknown template "${opts.template}". Options: ${flameTemplates.map(x => x.name).join(", ")}`);
      process.exit(1);
    }
    const gen = generateAnimatedFlame({...tpl?.config, reach, random: rng.next});
    return flameSvg(gen.generate(t), {
      width:  size,
      height: size,
      color:  opts.color ?? tpl?.color ?? "rgb(120,170,255)",
    });
  }
  console.error(`Unknown effect "${effect ?? ""}". Use "explosion" or "flame".`);
  process.exit(1);
}

writeFileSync(out, renderSvg());
console.log(`Wrote ${out} (effect=${effect}, seed=${seed}, t=${opts.t ?? "default"})`);
