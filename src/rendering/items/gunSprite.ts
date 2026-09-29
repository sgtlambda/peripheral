import {ItemSprite} from "../../logic/ItemType";

type Pt = [number, number];

const DEFAULT_COLOR = 'rgb(236,236,240)';

const tracePolygon = (context: CanvasRenderingContext2D, points: Pt[]) => {
  context.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) context.lineTo(points[i][0], points[i][1]);
  context.closePath();
};

/**
 * A single-colour sprite built from solid pieces (which may overlap) with
 * holes cut through the whole shape — negative space instead of a second
 * colour. The holes are clipped out, so whatever is behind shows through.
 */
const shapeSprite = ({center, muzzle, solids, holes = []}: {
  center: {x: number; y: number};
  muzzle?: {x: number; y: number};
  solids: Pt[][];
  holes?: Pt[][];
}) => (color = DEFAULT_COLOR): ItemSprite => ({
  center,
  muzzle,
  draw(context) {
    context.save();
    if (holes.length) {
      context.beginPath();
      context.rect(-100, -100, 200, 200);
      holes.forEach(hole => tracePolygon(context, hole));
      context.clip('evenodd');
    }
    context.beginPath();
    solids.forEach(solid => tracePolygon(context, solid));
    context.fillStyle = color;
    context.fill('nonzero');
    context.restore();
  },
});

const rect = (x: number, y: number, w: number, h: number): Pt[] =>
  [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** The line the coils sit on, in item space (y). */
const BORE_Y = -2.5;

/**
 * The gun: a single flat colour, no stroke. Drawn in item space — origin at
 * the grip, +x along the aim, y down — so the stock runs back across its
 * holder. Ahead of the body, three coils float in line, shrinking toward the
 * muzzle; shots leave the body's nose and run through them.
 */
export const createGunSprite = shapeSprite({
  center: {x: 5, y: -2},
  muzzle: {x: 6.5, y: BORE_Y},
  solids: [
    [[-14, -3], [-8, -5.5], [5, -5.5], [6.5, -4], [6.5, -1], [5, 0.5], [-13, 0.5]], // body and stock
    ...[0, 1, 2].map(i => {                                                          // coils
      const h = 6 - i * 1.5;
      return rect(8 + i * 4, BORE_Y - h / 2, 2.2 - i * 0.3, h);
    }),
    [[-1.5, 0], [2, 0], [0.5, 7], [-3, 7]],                                          // grip
  ],
});
