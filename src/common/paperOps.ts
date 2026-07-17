import {Vector} from "matter-js";

// const paper = require('paper/dist/paper-core.min'); // TODO (?)
import paper from 'paper/dist/paper-core';

paper.setup('');

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
  // TODO recursively normalize (?)
};

export const subtract = (from: Vector[], remove: Vector[]): Vector[][] => {
  const path1      = toPaperPath(from);
  const path2      = toPaperPath(remove);
  const subtracted = path1.subtract(path2);
  return normalizePaths(subtracted).map(path => fromPaperPath(path));
};

/**
 * Boolean-union a list of polygons into their combined outline(s).
 *
 * Returns one path per disjoint region (overlapping inputs collapse into a
 * single path). All intermediate paper.js objects are removed from the active
 * project so this is safe to call every frame.
 */
export const unite = (shapes: Vector[][]): Vector[][] => {
  if (shapes.length === 0) return [];

  const sources = shapes.map(toPaperPath);

  let result: PaperPath = sources[0].clone();
  for (let i = 1; i < sources.length; i++) {
    const next = result.unite(sources[i]);
    result.remove();
    result = next;
  }

  const out = normalizePaths(result).map(path => fromPaperPath(path));

  sources.forEach(source => source.remove());
  result.remove();

  return out;
};