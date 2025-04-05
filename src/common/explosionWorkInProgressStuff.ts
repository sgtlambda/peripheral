import circleVertices from "./circleVertices";
import {Vector, Vertices} from "matter-js";
import {times} from "lodash";
import {easing} from "ts-easing";
import {scaleVertices} from "./scaleVertices";

/**
 * prior art
 */
// export default function circleVerticesDelaunay(
//   radius: number,
//   resolution: number,
//   radiusRand          = 0,
//   rotateRand: boolean = false,
//   parts: number       = 5,
// ) {
//   const v = circleVertices(radius, resolution, radiusRand, rotateRand);
//   const d = new Delaunay(Float64Array.of(0, 40, 30, 20, 10, 12, 40, 50));
//   // console.log(d.render());
//   return d.render();
// }

const RAND = .2;

export function explosionTest() {

  const mainExplosionThing = Vertices.translate(
    circleVertices(100, 30, RAND, true),
    {x: 50, y: 50},
    1,
  );

  const gaps: {
    vectors: Vector[];
    center: Vector;
    delay: number;
  }[] = times(10, () => {
    const radius = 50 + Math.random() * 40;
    const center = Vector.create(Math.random() * 120, Math.random() * 120);
    return ({
      center,
      vectors: circleVertices(radius, 30, RAND, true),
      delay:   Math.random(),
    });
  });

  return (t: number) => {

    const gapPaths = gaps.map((gap) => {
      if (gap.delay > t) return null;
      // console.log(t - gap.delay);
      const sizeScale = easing.inOutQuint(Math.min(1, (t - gap.delay) * 4));
      // console.log({
      //   t,
      //   d:  gap.delay,
      //   ss: sizeScale,
      // })
      const cloned = gap.vectors.map(v => Vector.clone(v));

      return Vertices.translate(
        // Vertices.scale(cloned, sizeScale, sizeScale + 1, {x: 0, y: 0}),
        scaleVertices(cloned, sizeScale),
        gap.center,
        1,
      );

      // return Vertices.translate(
      //   Vertices.translate(cloned, {x: 0, y: 0}, sizeScale),
      //   gap.center,
      //   1,
      // );
    });

    // return gapPaths.reduce((result, gap) => {
    //   if (gap === null) return result;
    //   return result.flatMap(body => subtract(body, gap));
    // }, [mainExplosionThing]);
    return [
      mainExplosionThing,
      ...gapPaths.filter((path): path is Vector[] => path !== null && !!path.length),
    ];
  };
}