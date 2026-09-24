import {Rng} from "../../common/Rng";
import {PlayerDesign, PlayerRenderState} from "./types";
import {DotField, orbField} from "../halftone/field";
import {HalftoneSurface, HalftoneSurfaceOptions} from "../halftone/HalftoneSurface";
import {createThruster} from "./thruster";
import {Pt, clamp, createLayer, cut, disc, lens, ngon, poly, segment, template, tiltFor} from "./draw";

/**
 * Stylised player designs — each an art direction rather than a costume, and
 * each within the two-colour brief (flame included).
 */

/**
 * Lens bloom (one colour). Built from the flame's own vocabulary: a rosette of
 * breathing lens petals with a lens-shaped eye cut from its centre. Thrust
 * stretches the lower petals into the jet.
 */
export const lensBloomDesign = (): PlayerDesign => {
  const ice   = "rgb(160,232,255)";
  const layer = createLayer();
  const jet   = createThruster({reach: 20, color: ice, seed: 21, config: template("Wispy Tongues").config});
  const petals = 8;

  return {
    name:        "Lens bloom",
    description: "Made of the flame's lens primitive: breathing petals, a lens eye cut from the centre.",
    palette:     [ice],
    draw(ctx, state) {
      const {radius: r, aimAngle, velocity, thrust, time} = state;
      const drift = clamp(-velocity.x * 0.05, -0.4, 0.4);

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 1.8) * (1 - thrust));
        jet.draw(l, 0, r * 0.7, Math.PI / 2, thrust, time);

        for (let i = 0; i < petals; i++) {
          const a    = (i / petals) * Math.PI * 2 + time * 0.25;
          const down = Math.max(0, Math.sin(a));
          const len  = r * 0.5 * (1 + 0.14 * Math.sin(time * 2.2 + i * 1.7)) * (1 + down * thrust * 0.7);
          const bend = a + drift * Math.cos(a);
          poly(l, lens(Math.cos(bend) * len, Math.sin(bend) * len, len, len * 0.42, bend), ice);
        }
        disc(l, 0, 0, r * 0.5, ice);

        const ax = Math.cos(aimAngle), ay = Math.sin(aimAngle);
        cut(l, lens(ax * 1.5, ay * 1.5, r * 0.42, r * 0.2, 0));
        poly(l, lens(ax * 4, ay * 1.6, 2.4, 2.4, Math.PI / 2), ice);
      });
    },
  };
};

/**
 * Ensō (one colour). A single ink-brush circle that opens toward the aim, with
 * dry-brush streaks cut through its tail and one brush dot for an eye. Redrawn
 * at 8 fps with a wavering hand, like animated ink.
 */
export const ensoDesign = (): PlayerDesign => {
  const ink   = "rgb(246,238,222)";
  const layer = createLayer();
  const jet   = createThruster({reach: 22, color: ink, seed: 13, config: template("Split Fork").config});

  return {
    name:        "Ensō",
    description: "One ink-brush circle that opens toward the aim, dry-brush streaks, a single dot eye; 8 fps wobble.",
    palette:     [ink],
    draw(ctx, state) {
      const {radius: r, aimAngle, thrust, time} = state;
      const tilt  = tiltFor(state, 0.05, 0.3);
      const frame = Math.floor(time * 8);
      const rng   = new Rng(frame * 131 + 7);

      layer(ctx, state, l => {
        l.rotate(tilt);
        jet.draw(l, 0, r * 0.85, Math.PI / 2, thrust, time);

        // The stroke starts just past the gap and sweeps round to it, heavy
        // at the start and trailing off.
        const local = aimAngle - tilt;
        const gap   = 0.9;
        const start = local + gap / 2;
        const sweep = Math.PI * 2 - gap;
        const steps = 40;
        const R     = r * 0.78;
        const outer: Pt[] = [], inner: Pt[] = [];
        const wobble = Array.from({length: 6}, () => rng.range(-0.6, 0.6));
        for (let i = 0; i <= steps; i++) {
          const t  = i / steps;
          const a  = start + t * sweep;
          const w  = 1.2 + 4.4 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.05)), 0.7) * (1 - 0.55 * t);
          const rr = R + wobble[Math.floor(t * 5)] + Math.sin(t * 9) * 0.6;
          outer.push([Math.cos(a) * (rr + w / 2), Math.sin(a) * (rr + w / 2)]);
          inner.push([Math.cos(a) * (rr - w / 2), Math.sin(a) * (rr - w / 2)]);
        }
        poly(l, [...outer, ...inner.reverse()], ink);

        // Dry-brush: thin streaks cut along the tail of the stroke.
        [-1.2, 0.4, 1.6].forEach((offset, k) => {
          const from = 0.45 + k * 0.1 + rng.range(0, 0.05), to = 1;
          const streak: Pt[] = [];
          for (let i = 0; i <= 16; i++) {
            const t = from + (to - from) * (i / 16);
            const a = start + t * sweep;
            streak.push([Math.cos(a) * (R + offset), Math.sin(a) * (R + offset)]);
          }
          const back = streak.slice().reverse().map(([x, y]): Pt => {
            const len = Math.hypot(x, y);
            return [x * (len + 0.45) / len, y * (len + 0.45) / len];
          });
          cut(l, [...streak, ...back]);
        });

        const ex = Math.cos(local) * r * 0.2, ey = Math.sin(local) * r * 0.2;
        poly(l, ngon(ex + rng.range(-0.3, 0.3), ey, 3 + rng.range(-0.3, 0.3), 2.6, 7, rng.range(0, 1)), ink);
      });
    },
  };
};

/**
 * Origami (white + red). A folded-paper bird: white faces, red undersides that
 * flash as the wing flaps past the fold, crease lines cut in, head turned
 * toward the aim, red flame.
 */
export const origamiDesign = (): PlayerDesign => {
  const paper = "rgb(244,242,236)";
  const red   = "rgb(232,56,64)";
  const layer = createLayer();
  const jet   = createThruster({reach: 20, color: red, seed: 17, config: template("Blowtorch").config});

  return {
    name:        "Origami",
    description: "Folded-paper bird: white faces, red undersides flash as the wing flaps, head turns to the aim.",
    palette:     [paper, red],
    draw(ctx, state) {
      const {radius: r, aimAngle, thrust, time} = state;
      const tilt   = tiltFor(state, 0.06, 0.35);
      const facing = Math.cos(aimAngle) >= 0 ? 1 : -1;
      const local  = aimAngle - tilt;
      // Head pitch in the mirrored frame: straight ahead = 0.
      const pitch  = clamp(facing > 0 ? local : Math.PI - local, -1, 1);
      const pitchN = Math.atan2(Math.sin(pitch), Math.cos(pitch));

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 2) * (1 - thrust));
        l.rotate(tilt);
        l.scale(facing, 1);

        jet.draw(l, -r * 0.15, r * 0.42, Math.PI / 2 + 0.25, thrust, time);

        const tail: Pt[] = [[-r * 0.45, -r * 0.05], [-r * 1.1, -r * 0.8], [-r * 0.2, r * 0.25]];
        poly(l, tail, paper);
        poly(l, [tail[0], tail[1], [-r * 0.6, r * 0.05]], red);

        const body: Pt[] = [[-r * 0.8, -r * 0.05], [r * 0.5, -r * 0.2], [r * 0.05, r * 0.55]];
        poly(l, body, paper);
        poly(l, [body[0], body[2], [-r * 0.1, r * 0.12]], red);

        // Neck + head pivot at the shoulder, pitched toward the aim.
        l.save();
        l.translate(r * 0.35, -r * 0.1);
        l.rotate(clamp(pitchN, -0.7, 0.7) * 0.8);
        poly(l, [[-r * 0.05, 0], [r * 0.35, -r * 0.7], [r * 0.2, r * 0.12]], paper);
        poly(l, [[r * 0.35, -r * 0.7], [r * 0.75, -r * 0.55], [r * 0.3, -r * 0.5]], red);
        l.restore();

        // Wing: folds up and down; its red underside shows below the fold.
        const flap = Math.sin(time * (4 + thrust * 8));
        const tip: Pt = [-r * 0.25, -r * 0.15 - r * 0.95 * flap];
        poly(l, [[-r * 0.4, -r * 0.13], [r * 0.3, -r * 0.18], tip], flap >= 0 ? paper : red);
        if (flap >= 0) cut(l, [[-r * 0.1, -r * 0.16], [r * 0.02, -r * 0.16], [tip[0] + 1, tip[1] + 3]]);
      });
    },
  };
};

/**
 * Halftone (one colour). A sphere printed as a rotated dot screen, lit from the
 * direction it looks, with an unprinted almond for the eye. Thrust is a dotted
 * plume instead of a flame.
 */
export const halftoneDesign = (): PlayerDesign => {
  const ink   = "rgb(255,86,160)";
  const layer = createLayer();

  return {
    name:        "Halftone",
    description: "Printed dot-screen sphere lit from the direction it looks, blank-paper eye, dotted plume for thrust.",
    palette:     [ink],
    draw(ctx, state) {
      const {radius: r, aimAngle, thrust, time} = state;
      const tilt  = tiltFor(state, 0.05, 0.3);
      const local = aimAngle - tilt;
      const lx = Math.cos(local), ly = Math.sin(local);
      const R  = r * 0.85, pitch = 2.6, screen = 0.26;
      const cs = Math.cos(screen), sn = Math.sin(screen);

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 2.2) * (1 - thrust));
        l.rotate(tilt);

        const eyeX = lx * R * 0.45, eyeY = ly * R * 0.3;
        const inEye = (x: number, y: number) => {
          const u = (x - eyeX) / (R * 0.38), v = (y - eyeY) / (R * 0.2);
          return u * u + v * v < 1;
        };

        for (let i = -12; i <= 12; i++) {
          for (let j = -12; j <= 16; j++) {
            const x = (i * cs - j * sn) * pitch, y = (i * sn + j * cs) * pitch;
            const d = Math.hypot(x, y);
            let size = 0;
            if (d < R) {
              if (inEye(x, y)) continue;
              // Sphere shading: brighter (bigger dots) facing the aim.
              const z     = Math.sqrt(1 - (d / R) ** 2);
              const light = clamp((x * lx + y * ly) / R * 0.7 + z * 0.55, 0, 1);
              size = 0.25 + light * 1.2;
            } else if (thrust > 0.02 && y > R * 0.5) {
              // Plume: a cone of dots below, scrolling downward.
              const depth = y - R * 0.5, spread = 2 + depth * 0.35;
              if (Math.abs(x) < spread && depth < r * 2.2 * thrust) {
                const flicker = 0.6 + 0.4 * Math.sin(depth * 0.9 - time * 18 + i);
                size = (1 - depth / (r * 2.2)) * (1 - Math.abs(x) / spread) * 1.4 * flicker * thrust;
              }
            }
            if (size > 0.15) disc(l, x, y, size, ink);
          }
        }
        disc(l, eyeX + lx * 1.5, eyeY + ly * 1, 1.9, ink);
      });
    },
  };
};

/**
 * Constellation (one colour). A little figure drawn as a star chart: twinkling
 * four-point stars joined by hairlines, one arm reaching for the aim. Thrust
 * sheds a stream of falling stars.
 */
export const constellationDesign = (): PlayerDesign => {
  const star  = "rgb(214,226,255)";
  const layer = createLayer();

  const sparkle = (l: CanvasRenderingContext2D, x: number, y: number, s: number, spin: number) => {
    if (s <= 0.1) return;
    const pts: Pt[] = [];
    for (let i = 0; i < 8; i++) {
      const a = spin + (i / 8) * Math.PI * 2, rr = i % 2 ? s * 0.28 : s;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    poly(l, pts, star);
  };

  return {
    name:        "Constellation",
    description: "A star-chart figure: twinkling stars joined by hairlines, an arm reaching for the aim, falling-star thrust.",
    palette:     [star],
    draw(ctx, state) {
      const {radius: r, aimAngle, velocity, thrust, time} = state;
      const tilt  = tiltFor(state, 0.05, 0.3);
      const local = aimAngle - tilt;
      const sway  = Math.sin(time * 2.4) * 0.12 - velocity.x * 0.04 - thrust * 0.2;

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 1.6) * (1 - thrust));
        l.rotate(tilt);

        const head: Pt = [0, -r * 0.62], neck: Pt = [0, -r * 0.25], hip: Pt = [0, r * 0.3];
        const back: Pt = [-Math.cos(local) * r * 0.5, -r * 0.05 - Math.sin(local) * r * 0.2];
        const hand: Pt = [Math.cos(local) * r * 0.95, -r * 0.2 + Math.sin(local) * r * 0.95];
        const elbow: Pt = [(neck[0] + hand[0]) / 2 + 1.5, (neck[1] + hand[1]) / 2 + 1.5];
        const foot = (side: number): Pt =>
          [hip[0] + Math.sin(sway + side * 0.3) * r * 0.62, hip[1] + Math.cos(sway + side * 0.3) * r * 0.62];
        const feet = [foot(-1), foot(1)];

        const lines: [Pt, Pt][] = [[head, neck], [neck, hip], [neck, elbow], [elbow, hand], [neck, back],
          [hip, feet[0]], [hip, feet[1]]];
        lines.forEach(([a, b]) => segment(l, a[0], a[1], b[0], b[1], 0.7, star));

        const tw = (k: number) => 0.75 + 0.25 * Math.sin(time * 5 + k * 2.1);
        sparkle(l, head[0], head[1], 5.5 * tw(0), time * 0.3);
        [neck, hip, elbow, back, ...feet].forEach((p, k) => sparkle(l, p[0], p[1], 2.6 * tw(k + 1), 0.4));
        sparkle(l, hand[0], hand[1], 4 * tw(9), time * -0.5);

        // Falling stars shed from the hip while thrusting.
        for (let k = 0; k < 10; k++) {
          const age = (time * 1.4 + k / 10) % 1;
          const x   = hip[0] + Math.sin(k * 12.9) * 3 + Math.sin(k * 3.1) * age * 5;
          const y   = hip[1] + 4 + age * r * 1.8;
          sparkle(l, x, y, (1 - age) * 3 * thrust, k);
        }
      });
    },
  };
};

/**
 * Bauhaus (cream + red). A composition of pure primitives: a cream disc body,
 * a red half-disc cap that swings to face the aim, a red bar for an arm, a
 * cream triangle nozzle and a red flame. Smooth arcs, no facets — the formal
 * opposite of the stop-motion look.
 */
export const bauhausDesign = (): PlayerDesign => {
  const cream = "rgb(242,234,214)";
  const red   = "rgb(226,58,44)";
  const layer = createLayer();
  const jet   = createThruster({reach: 20, color: red, seed: 29, config: template("Pilot Light").config});

  return {
    name:        "Bauhaus",
    description: "Pure primitives: cream disc, red half-disc cap facing the aim, red bar arm, triangle nozzle.",
    palette:     [cream, red],
    draw(ctx, state) {
      const {radius: r, aimAngle, thrust, time} = state;
      const tilt  = tiltFor(state, 0.07, 0.4);
      const local = aimAngle - tilt;

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 2) * (1 - thrust));
        l.rotate(tilt);

        jet.draw(l, 0, r * 1.0, Math.PI / 2, 0.2 + 0.8 * thrust, time);
        poly(l, [[-r * 0.3, r * 0.62], [r * 0.3, r * 0.62], [0, r * 1.02]], cream);

        const ax = Math.cos(local), ay = Math.sin(local);
        const at = (d: number, w: number): Pt => [ax * d - ay * w, ay * d + ax * w];
        poly(l, [at(r * 0.2, 2), at(r * 1.35, 2), at(r * 1.35, -2), at(r * 0.2, -2)], red);

        disc(l, 0, 0, r * 0.78, cream);

        // Half-disc cap on the aim side, slightly offset from the body.
        l.beginPath();
        l.arc(ax * 1.5, ay * 1.5, r * 0.62, local - Math.PI / 2, local + Math.PI / 2);
        l.closePath();
        l.fillStyle = red;
        l.fill();

        disc(l, ax * r * 0.32, ay * r * 0.32, r * 0.14, cream);
        cut(l, ngon(-ax * r * 0.35, -ay * r * 0.35, 1.6, 1.6, 12));
      });
    },
  };
};


/** The halftone character's dot field, from a design's render state; see `orbField`. */
function halftoneBodyField(state: PlayerRenderState, maxDot: number): DotField {
  const {x, y, radius, aimAngle, thrust, time} = state;
  return orbField({
    x, y, radius, maxDot, time, thrust,
    look: aimAngle,
    tilt: tiltFor(state, 0.05, 0.3),
    bob:  Math.sin(time * 2.2) * (1 - thrust),
  });
}

/** Fill every dot in one path — thousands of arcs, one fill call. */
function fillDots(ctx: CanvasRenderingContext2D, dots: [number, number, number][], ink: string): void {
  ctx.beginPath();
  for (const [dx, dy, s] of dots) {
    ctx.moveTo(dx + s, dy);
    ctx.arc(dx, dy, s, 0, Math.PI * 2);
  }
  ctx.fillStyle = ink;
  ctx.fill();
}

/**
 * Halftone, world grid (one colour). Like `halftoneDesign`, but the dot screen
 * is fixed in world space, axis-aligned with the terrain: the character is a
 * density field that the grid samples, so moving lights up the dots it passes
 * over instead of carrying dots along. Lit dots fade out over `afterglow`
 * seconds, leaving a brief dotted wake (and a dotted exhaust trail).
 */
export const halftoneGridDesign = (
  {pitch = 3, afterglow = 0.14}: {pitch?: number; afterglow?: number} = {},
): PlayerDesign => {
  const ink = "rgb(255,86,160)";
  /** Per grid cell: the last dot size it was lit to, and when. */
  const glow = new Map<string, {size: number; time: number}>();
  const maxDot = pitch * 0.62;

  return {
    name:        "Halftone · world grid",
    description: "Dot screen fixed to the world; the character lights up the dots it covers, leaving a brief afterglow wake.",
    palette:     [ink],
    draw(ctx, state) {
      const {x, y, radius: r, time} = state;
      const field = halftoneBodyField(state, maxDot);

      const reach = r * 3.5;
      const i0 = Math.floor((x - reach) / pitch), i1 = Math.ceil((x + reach) / pitch);
      const j0 = Math.floor((y - reach) / pitch), j1 = Math.ceil((y + reach) / pitch);

      const dots: [number, number, number][] = [];
      const visited = new Set<string>();
      const settle = (key: string, wx: number, wy: number, size: number) => {
        const prev    = glow.get(key);
        // Quadratic falloff: dots shrink fast at first, so the wake stays a short tail.
        const decayed = prev ? prev.size * Math.max(0, 1 - (time - prev.time) / afterglow) ** 2 : 0;
        if (size >= decayed && size > 0) glow.set(key, {size, time});
        else if (decayed <= 0.05) glow.delete(key);
        const shown = Math.max(size, decayed);
        if (shown > 0.2) dots.push([wx, wy, shown]);
      };

      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          const key = `${i},${j}`;
          visited.add(key);
          settle(key, i * pitch, j * pitch, Math.max(0, field(i * pitch, j * pitch)));
        }
      }
      // Cells left behind: nothing covers them now, they just fade.
      for (const key of Array.from(glow.keys())) {
        if (visited.has(key)) continue;
        const [i, j] = key.split(",").map(Number);
        settle(key, i * pitch, j * pitch, 0);
      }

      fillDots(ctx, dots, ink);
    },
  };
};

/**
 * Halftone, noise trail (one colour). The world-grid character on a
 * `HalftoneSurface`: instead of a per-dot afterglow it leaves a cooling heat
 * trail, revealed through an evolving world noise field as organic patches of
 * dimmed dots that dissolve as they cool. This is the look the game uses for
 * every entity; see `halftoneLayer`.
 */
export const halftoneNoiseTrailDesign = (
  {blobRatio = 0.6, ...surfaceOptions}: HalftoneSurfaceOptions & {
    /** Width of the heat trail (gaussian sigma), as a ratio of the collider radius */
    blobRatio?: number;
  } = {},
): PlayerDesign => {
  const ink     = "rgb(255,86,160)";
  const surface = new HalftoneSurface(surfaceOptions);
  const key     = {};

  return {
    name:        "Halftone · noise trail",
    description: "World-grid body leaving a cooling heat trail; a slowly morphing world noise field decides which dimmed dots it reveals.",
    palette:     [ink],
    draw(ctx, state) {
      surface.draw(ctx, [{
        key, x: state.x, y: state.y, reach: state.radius * 3.5, color: ink,
        field: halftoneBodyField(state, surface.maxDot),
        trail: {sigma: state.radius * blobRatio},
      }], state.time);
    },
  };
};

export const artsyPlayerDesigns = [
  lensBloomDesign, ensoDesign, origamiDesign, halftoneDesign, () => halftoneGridDesign(), () => halftoneNoiseTrailDesign(), constellationDesign, bauhausDesign,
];
