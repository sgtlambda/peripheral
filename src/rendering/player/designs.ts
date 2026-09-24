import {PlayerDesign} from "./types";
import {createThruster} from "./thruster";
import {Pt, clamp, createLayer, cut, cutSegment, ngon, poly, segment, template, tiltFor, tracePoly} from "./draw";

/** The current in-game look: collider ring plus the aim arrow from `playerInteractionLayer`. */
export const currentDesign = (): PlayerDesign => ({
  name:        "Current",
  description: "Today's look: collider circle and aim arrow.",
  palette:     ["rgb(255,255,255)"],
  draw(ctx, {x, y, radius, aimAngle}) {
    ctx.save();
    ctx.lineWidth   = 1;
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    const offset = 20, length = 10, width = 5;
    const cos = Math.cos(aimAngle), sin = Math.sin(aimAngle);
    const at = (u: number, v: number): Pt => [x + u * cos - v * sin, y + u * sin + v * cos];
    tracePoly(ctx, [at(offset, width), at(offset, -width), at(offset + length, 0)]);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.stroke();
    ctx.restore();
  },
});

/**
 * Cutout drone (white + orange). The README's "wall-e esque robot floating with
 * a thruster": a faceted egg with a visor slot cut clean through it, an orange
 * eye sliding inside the slot toward the aim, and an orange belly flame.
 */
export const cutoutDroneDesign = (): PlayerDesign => {
  const white  = "rgb(240,240,244)";
  const orange = "rgb(255,138,48)";
  const layer  = createLayer();
  const flame  = createThruster({reach: 22, color: orange, seed: 3, config: template("Blowtorch").config});

  return {
    name:        "Cutout drone",
    description: "White egg robot; visor slot cut through the body, orange eye tracks the aim, orange belly jet.",
    palette:     [white, orange],
    draw(ctx, state) {
      const {radius: r, aimAngle, thrust, time} = state;
      const tilt  = tiltFor(state, 0.08, 0.4);
      const local = aimAngle - tilt;

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 2.4) * 1.2 * (1 - thrust));
        l.rotate(tilt);

        // Idle pilot light, so it always reads as hovering.
        flame.draw(l, 0, r * 0.95, Math.PI / 2, 0.25 + 0.75 * thrust, time);
        poly(l, [[-3.5, r * 0.6], [3.5, r * 0.6], [5, r * 0.98], [-5, r * 0.98]], white);
        cutSegment(l, -6, r * 0.78, 6, r * 0.78, 1);

        poly(l, ngon(0, 0, r * 0.82, r * 0.9, 10), white);
        cutSegment(l, -r * 0.62, r * 0.36, r * 0.62, r * 0.36, 1.2);

        const visorY = -r * 0.22;
        cut(l, ngon(0, visorY, r * 0.62, r * 0.25, 8, Math.PI / 8));
        poly(l, ngon(Math.cos(local) * r * 0.3, visorY + Math.sin(local) * r * 0.08, 3.4, 2.4, 6, Math.PI / 6), orange);

        // Arm, separated from the body by a cut outline rather than a shade.
        const ax = Math.cos(local), ay = Math.sin(local), py = r * 0.2;
        const x1 = ax * r * 0.5, y1 = py + ay * r * 0.5, x2 = ax * (r + 6), y2 = py + ay * (r + 6);
        cutSegment(l, x1, y1, x2, y2, 5.5);
        segment(l, x1, y1, x2, y2, 3, white);
        poly(l, ngon(x2, y2, 2.6, 2.6, 5, local), orange);
      });
    },
  };
};

/**
 * Silhouette (orange + white). The astronaut as one flat orange shape: visor,
 * belt and pack seam are cut out, the arm is outlined by a cut, and the twin
 * jetpack flames are the second colour.
 */
export const silhouetteDesign = (): PlayerDesign => {
  const orange = "rgb(255,146,56)";
  const white  = "rgb(245,245,250)";
  const layer  = createLayer();
  const flames = [5, 9].map(seed => createThruster({reach: 20, color: white, seed, config: template("Butane Torch").config}));

  return {
    name:        "Silhouette",
    description: "Single-colour astronaut; visor, seams and arm outline are cutouts; white twin jets.",
    palette:     [orange, white],
    draw(ctx, state) {
      const {radius: r, aimAngle, velocity, thrust, time} = state;
      const tilt   = tiltFor(state, 0.06, 0.35);
      const facing = Math.cos(aimAngle) >= 0 ? 1 : -1;

      layer(ctx, state, l => {
        l.rotate(tilt);

        l.save();
        l.scale(facing, 1);
        const swing = Math.sin(time * 3) * 0.12 - velocity.x * facing * 0.05 - thrust * 0.25;
        [-1, 1].forEach((side, i) => {
          const hx = side * 3, hy = r * 0.4, a = Math.PI / 2 + swing + (i ? 0.1 : -0.05);
          const kx = hx + Math.cos(a) * r * 0.55, ky = hy + Math.sin(a) * r * 0.55;
          segment(l, hx, hy, kx, ky, 4, orange);
          segment(l, kx, ky, kx + 1.8, ky + 0.6, 4, orange);
        });

        const packX = -r * 0.62;
        flames.forEach((f, i) => f.draw(l, packX + (i ? 2.6 : -2.6), r * 0.5, Math.PI / 2 + 0.15, thrust, time + i * 0.37));
        poly(l, [[packX - 5, -r * 0.3], [packX + 5, -r * 0.35], [packX + 5, r * 0.35], [packX - 5, r * 0.35]], orange);
        [-2.6, 2.6].forEach(dx =>
          poly(l, [[packX + dx - 1.8, r * 0.33], [packX + dx + 1.8, r * 0.33], [packX + dx + 2.2, r * 0.5], [packX + dx - 2.2, r * 0.5]], orange));
        cutSegment(l, packX - 5, r * 0.36, packX + 5, r * 0.36, 0.9);

        poly(l, [[-r * 0.38, -r * 0.1], [r * 0.38, -r * 0.1], [r * 0.34, r * 0.46], [-r * 0.34, r * 0.46]], orange);
        cutSegment(l, packX + 5.6, -r * 0.3, packX + 5.6, r * 0.1, 1);
        cutSegment(l, -r * 0.3, r * 0.24, r * 0.4, r * 0.24, 1);

        const headY = -r * 0.5, lookY = Math.sin(aimAngle) * 1.8;
        poly(l, ngon(0, headY, r * 0.52, r * 0.5, 9), orange);
        cut(l, ngon(r * 0.18, headY + lookY, r * 0.32, r * 0.22, 7, Math.PI / 2));
        l.restore();

        const local = aimAngle - tilt;
        const sx = facing * r * 0.05, sy = -r * 0.02;
        const ex = sx + Math.cos(local) * r * 0.95, ey = sy + Math.sin(local) * r * 0.95;
        // Outline only where the arm crosses the torso, never the helmet.
        const inset = r * 0.3;
        cutSegment(l, sx + Math.cos(local) * inset, sy + Math.sin(local) * inset, ex, ey, 6);
        segment(l, sx + Math.cos(local) * inset, sy + Math.sin(local) * inset, ex, ey, 3.5, orange);
        poly(l, ngon(ex, ey, 2.2, 2.2, 5), orange);
      });
    },
  };
};

/**
 * Wisp (one colour). The character is itself a flame, built on the same
 * generator as the effects: a faceted ember with a flame body that leans away
 * from motion, cut-out eyes that look at the aim, and a spark marking the aim.
 * Thrust is just more of itself, flaring downward.
 */
export const wispDesign = (): PlayerDesign => {
  const amber = "rgb(255,178,72)";
  const layer = createLayer();
  const body  = createThruster({reach: 28, color: amber, seed: 11, config: template("Candle").config});
  const jet   = createThruster({reach: 22, color: amber, seed: 4, config: template("Blowtorch").config});

  return {
    name:        "Wisp",
    description: "One colour: a living flame. Cut-out eyes follow the aim, a spark marks it, thrust flares downward.",
    palette:     [amber],
    draw(ctx, state) {
      const {radius: r, aimAngle, velocity, thrust, time} = state;
      const lean = -clamp(velocity.x * 0.07, -0.5, 0.5);

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 2) * 1.2 * (1 - thrust));

        jet.draw(l, 0, r * 0.7, Math.PI / 2, thrust, time);
        body.draw(l, 0, r * 0.25, -Math.PI / 2 + lean, 1, time);
        poly(l, ngon(0, r * 0.3, r * 0.62, r * 0.58, 9), amber);

        const lx = Math.cos(aimAngle) * r * 0.16, ly = Math.sin(aimAngle) * r * 0.1;
        const blink = time % 3.7 < 0.1 ? 0.25 : 1;
        [-1, 1].forEach(side => cut(l, ngon(side * r * 0.22 + lx, r * 0.22 + ly, 2, 3.4 * blink, 6)));

        const sx = Math.cos(aimAngle) * r * 1.35, sy = r * 0.1 + Math.sin(aimAngle) * r * 1.35;
        poly(l, ngon(sx, sy, 2.2, 2.2, 4, aimAngle + time * 4), amber);
      });
    },
  };
};

/**
 * Eye ring (white + red). A hovering white ring with a red core that looks
 * toward the aim, a red notch on the rim marking it, and two angled red jets.
 */
export const eyeRingDesign = (): PlayerDesign => {
  const white = "rgb(240,240,244)";
  const red   = "rgb(255,70,70)";
  const layer = createLayer();
  const jets  = [2, 6].map(seed => createThruster({reach: 18, color: red, seed, config: template("Pilot Light").config}));

  return {
    name:        "Eye ring",
    description: "White ring with a red core that looks at the aim, red aim notch on the rim, twin red jets.",
    palette:     [white, red],
    draw(ctx, state) {
      const {radius: r, aimAngle, thrust, time} = state;
      const tilt  = tiltFor(state, 0.07, 0.4);
      const local = aimAngle - tilt;

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 2.2) * 1 * (1 - thrust));
        l.rotate(tilt);

        [-1, 1].forEach((side, i) => {
          const a = Math.PI / 2 + side * 0.55;
          const nx = Math.cos(a) * r * 0.9, ny = Math.sin(a) * r * 0.9;
          jets[i].draw(l, nx, ny, a - side * 0.35, 0.2 + 0.8 * thrust, time + i * 0.5);
          poly(l, ngon(nx, ny, 3, 3, 4, a), white);
        });

        poly(l, ngon(0, 0, r * 0.92, r * 0.92, 12, time * 0.3), white);
        cut(l, ngon(0, 0, r * 0.6, r * 0.6, 12, time * 0.3));

        const ax = Math.cos(local), ay = Math.sin(local);
        const cx = ax * r * 0.14, cy = ay * r * 0.14;
        poly(l, ngon(cx, cy, r * 0.36, r * 0.36, 8), red);
        const px = cx + ax * r * 0.13, py = cy + ay * r * 0.13;
        cut(l, [[px + ax * 3, py + ay * 3], [px - ay * 1.4, py + ax * 1.4], [px - ax * 3, py - ay * 3], [px + ay * 1.4, py - ax * 1.4]]);

        const at = (d: number, w: number): Pt => [ax * d - ay * w, ay * d + ax * w];
        cut(l, [at(r * 0.72, 3.6), at(r * 1.02, 3.6), at(r * 1.02, -3.6), at(r * 0.72, -3.6)]);
        poly(l, [at(r * 1.08, 3.4), at(r * 1.08, -3.4), at(r * 1.42, 0)], red);
      });
    },
  };
};

/**
 * Blockhead (one colour). Everything white, like the terrain: a squat faceted
 * head with slit eyes cut out (they shift toward the aim and blink), a swaying
 * antenna, twin nozzles and white jets, and a white chevron marking the aim.
 */
export const blockheadDesign = (): PlayerDesign => {
  const white = "rgb(240,240,244)";
  const layer = createLayer();
  const jets  = [1, 8].map(seed => createThruster({reach: 18, color: white, seed, config: template("Butane Torch").config}));

  return {
    name:        "Blockhead",
    description: "One colour, all white like the terrain: slit eyes cut out, antenna, twin white jets, aim chevron.",
    palette:     [white],
    draw(ctx, state) {
      const {radius: r, aimAngle, velocity, thrust, time} = state;
      const tilt  = tiltFor(state, 0.06, 0.35);
      const local = aimAngle - tilt;

      layer(ctx, state, l => {
        l.translate(0, Math.sin(time * 2.6) * 1 * (1 - thrust));
        l.rotate(tilt);

        [-1, 1].forEach((side, i) => {
          const nx = side * r * 0.42, ny = r * 0.72;
          jets[i].draw(l, nx, ny + 2, Math.PI / 2, thrust, time + i * 0.4);
          poly(l, [[nx - 2.5, ny - 2], [nx + 2.5, ny - 2], [nx + 3.5, ny + 2.5], [nx - 3.5, ny + 2.5]], white);
        });

        poly(l, ngon(0, 0, r * 0.95, r * 0.8, 8, Math.PI / 8), white);
        cutSegment(l, -r * 0.7, r * 0.42, r * 0.7, r * 0.42, 1);

        const ex = Math.cos(local) * r * 0.16, ey = Math.sin(local) * r * 0.1;
        const blink = time % 4.3 < 0.1 ? 0.2 : 1;
        [-1, 1].forEach(side => {
          const cx = side * r * 0.3 + ex, cy = -r * 0.08 + ey, h = 3.6 * blink;
          cut(l, [[cx - 2, cy - h], [cx + 2, cy - h], [cx + 2, cy + h], [cx - 2, cy + h]]);
        });

        const sway = Math.sin(time * 2.1) * 0.15 - velocity.x * 0.04;
        const bx = r * 0.3, by = -r * 0.72;
        const tx = bx + Math.sin(sway) * r * 0.5, ty = by - Math.cos(sway) * r * 0.5;
        segment(l, bx, by, tx, ty, 1.5, white);
        poly(l, ngon(tx, ty, 2.2, 2.2, 4), white);

        const ax = Math.cos(local), ay = Math.sin(local);
        const at = (d: number, w: number): Pt => [ax * d - ay * w, ay * d + ax * w];
        poly(l, [at(r * 1.25, 4), at(r * 1.55, 0), at(r * 1.25, -4), at(r * 1.35, 0)], white);
      });
    },
  };
};

export const playerDesigns = [currentDesign, cutoutDroneDesign, silhouetteDesign, wispDesign, eyeRingDesign, blockheadDesign];
