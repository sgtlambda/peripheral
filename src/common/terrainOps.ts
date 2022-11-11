import {Vector} from "matter-js";
import paper from "paper";

const paper = require('paper/dist/paper-core.min'); // TODO (?)
paper.setup();

const toPaperPath = (points: Vector[]): paper.Path => {
  const path = new paper.Path();
  points.forEach(({x, y}) => {
    path.add(new paper.Point(x, y));
  });
  path.closed = true;
  return path;
};

const fromPaperPath = (path: paper.Path): Vector[] => path._segments.map(segment => {
  return {x: segment._point.x, y: segment._point.y};
});

const normalizePaths = path => { // TODO typing (?)
  if (path._segments) return [path];
  else return path._children;
};

export const subtract = (from: Vector[], remove: Vector[]): Vector[][] => {
  const path1      = toPaperPath(from);
  const path2      = toPaperPath(remove);
  const subtracted = path1.subtract(path2);
  return normalizePaths(subtracted).map(path => fromPaperPath(path));
};