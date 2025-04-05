import circleVertices from "./circleVertices";
import {Vector, Vertices} from "matter-js";
import {times} from "lodash";
import {easing} from "ts-easing";
import {applySwirl} from "./swirl";

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

const RAND = .25;

const SWIRL_INTENSITY = .5 * Math.PI;

export function explosionTest() {
  // Add a random swirl origin
  const swirlOrigin: [number, number] = [
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
  ];

  const mainExplosionThing = Vertices.translate(
    circleVertices(100, 30, RAND, true),
    {x: 0, y: 0},
    1,
  );

  const gaps: {
    vectors: Vector[];
    center: Vector;
    delay: number;
  }[] = times(12, () => {
    const radius = 40 + Math.random() * 40;
    const center = Vector.create(Math.random() * 120 - 60, Math.random() * 120 - 60);
    return ({
      center,
      vectors: circleVertices(radius, 30, RAND, true),
      delay:   Math.random() * .7,
    });
  });

  return (t: number) => {

    // Calculate swirl intensity based on time
    const swirlIntensity = SWIRL_INTENSITY * t; // Full rotation at t=1
    const swirlRadius = 100; // Adjust this to control the falloff distance

    const gapPaths = gaps.map((gap) => {
      if (gap.delay > t) return null;
      const sizeScale = easing.inOutQuint(Math.min(1, (t - gap.delay) * 4));
      const cloned    = gap.vectors.map(v => Vector.clone(v));

      return Vertices.translate(
        Vertices.scale(cloned, sizeScale, sizeScale, {x: 0, y: 0}),
        gap.center,
        1,
      );
    });

    // paper based:
    // return gapPaths.reduce((result, gap) => {
    //   if (gap === null) return result;
    //   return result.flatMap(body => subtract(body, gap));
    // }, [mainExplosionThing]);
    
    const paths =  [
      mainExplosionThing,
      ...gapPaths.filter((path): path is Vector[] => path !== null && !!path.length),
    ];

    const swirledPaths = paths.map(path => {
      return path.map(v => {
        const [swirledX, swirledY] = applySwirl(
          [v.x, v.y],
          swirlOrigin,
          swirlIntensity,
          swirlRadius
        );
        return Vector.create(swirledX, swirledY);
      });
    });

    return swirledPaths;
    
  };
}