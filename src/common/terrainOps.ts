import {Vector} from "matter-js";

const paper = require('paper/dist/paper-core.min'); // TODO (?)

paper.setup();

type PaperPath = any; // TODO

const toPaperPath = (points: Vector[]): PaperPath => {
  const path = new paper.Path();
  points.forEach(({x, y}) => {
    path.add(new paper.Point(x, y));
  });
  path.closed = true;
  return path;
};

const fromPaperPath = (path: PaperPath): Vector[] => {
  return path._segments.map((segment: any) => {
    return {x: segment._point.x, y: segment._point.y};
  });
};

/**
 * Normalize a "compound" paths (if applicable) into singular paths
 */
const normalizePaths = (path: PaperPath): PaperPath[] => {
  if (path._segments) return [path];
  else return path._children;
};

export const subtract = (from: Vector[], remove: Vector[]): Vector[][] => {
  const path1      = toPaperPath(from);
  const path2      = toPaperPath(remove);
  const subtracted = path1.subtract(path2);
  return normalizePaths(subtracted).map(path => fromPaperPath(path));
};