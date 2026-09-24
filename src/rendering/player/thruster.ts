import {FlameGeneratorConfig, generateAnimatedFlame} from "../../common/flame";
import {renderFlame} from "../../common/renderFlame";
import {Rng} from "../../common/Rng";

export type Thruster = {
  /**
   * Draw the flame from a nozzle at (x, y) in the current context space,
   * pointing along `angle`. `thrust` (0-1) scales the flame; nothing is drawn at 0.
   */
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, thrust: number, time: number): void;
};

/**
 * A jetpack flame built on the shared flame generator. The generator is created
 * once, pointing along +x, and rotated into place by the context — so a design
 * can tilt and mirror its nozzles freely without regenerating the flame.
 */
export function createThruster(
  {reach, color, seed = 1, config = {}}: {
    reach: number;
    color: string;
    seed?: number;
    config?: Omit<Partial<FlameGeneratorConfig>, "reach" | "direction" | "random">;
  },
): Thruster {
  const generator = generateAnimatedFlame({
    ...config,
    reach,
    direction: 0,
    random:    new Rng(seed).next,
  });

  return {
    draw(ctx, x, y, angle, thrust, time) {
      if (thrust <= 0.01) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      // Grow mostly in length, a little in width, as the throttle opens.
      ctx.scale(thrust, 0.6 + 0.4 * thrust);

      // renderFlame rasterises through a temp canvas in model units, which a
      // zoomed context would upscale into a blur. Pre-scale the geometry to
      // device pixels and undo it on the context so the flame stays crisp.
      const m = ctx.getTransform();
      const s = Math.max(1, Math.hypot(m.a, m.b), Math.hypot(m.c, m.d));
      const shape = generator.generate(time);
      const up = (polys: {x: number; y: number}[][]) => polys.map(p => p.map(v => ({x: v.x * s, y: v.y * s})));
      ctx.scale(1 / s, 1 / s);
      renderFlame(ctx, {...shape, body: up(shape.body), holes: up(shape.holes)}, {color});
      ctx.restore();
    },
  };
}
