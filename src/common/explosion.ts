import circleVertices from "./circleVertices";
import {Vector, Vertices} from "matter-js";
import {times} from "lodash";
import {easing} from "ts-easing";
import {applySwirl} from "./swirl";

/**
 * Configuration for generating an animated explosion
 */
export type ExplosionGeneratorConfig = {
  /** Main explosion radius (default: 100) */
  radius?: number;
  /** Number of vertices in the explosion shape (default: 30) */
  resolution?: number;
  /** Randomness factor for the vertices (0-1, default: 0.25) */
  radiusRand?: number;
  /** Whether to randomly rotate the shapes (default: true) */
  rotateRand?: boolean;
  /** Number of gaps/holes in the explosion (default: 12) */
  gapCount?: number;
  /** Minimum size of gaps (default: 40) */
  minGapSize?: number;
  /** Maximum size of gaps (default: 80) */
  maxGapSize?: number;
  /** Maximum spread distance of gaps from center (default: 120) */
  gapSpread?: number;
  /** Maximum delay before gaps appear (0-1, default: 0.7) */
  maxGapDelay?: number;
  /** Swirl effect intensity in radians (default: 0.5π) */
  swirlIntensity?: number;
  /** Radius controlling swirl effect falloff (default: 100) */
  swirlRadius?: number;
  /** Speed multiplier for gap growth (default: 4) */
  gapGrowthSpeed?: number;
}

/**
 * Function that generates explosion paths for a specific time
 */
export type ExplosionPathGenerator = (t: number) => Vector[][];

/**
 * Object returned by the explosion generator
 */
export type ExplosionGenerator = {
  /** The original main explosion shape */
  originalShape: Vector[];
  /** Function to generate explosion paths for a specific time */
  generate: ExplosionPathGenerator;
}

/**
 * Generates an animated explosion effect with a swirl transform
 * 
 * @param config Configuration options for the explosion
 * @returns Object containing the original shape and a function that generates time-based explosion paths
 */
export function generateAnimatedExplosion(config: ExplosionGeneratorConfig = {}): ExplosionGenerator {
  // Default configuration values
  const {
    radius = 100,
    resolution = 30,
    radiusRand = 0.25,
    rotateRand = true,
    gapCount = 12,
    minGapSize = 40,
    maxGapSize = 80,
    gapSpread = 120,
    maxGapDelay = 0.7,
    swirlIntensity = 0.5 * Math.PI,
    swirlRadius = 100,
    gapGrowthSpeed = 4
  } = config;

  // Generate swirl origin within the explosion area
  const swirlOrigin: [number, number] = [
    Math.random() * radius - radius/2,
    Math.random() * radius - radius/2,
  ];

  // Create main explosion shape
  const mainExplosionShape = Vertices.translate(
    circleVertices(radius, resolution, radiusRand, rotateRand),
    {x: 0, y: 0},
    1,
  );

  // Calculate the center adjustment for gap positioning
  const gapCenter = gapSpread / 2;

  // Generate gaps (holes in the explosion)
  const gaps: {
    vectors: Vector[];
    center: Vector;
    delay: number;
  }[] = times(gapCount, () => {
    // Random size between min and max
    const gapRadius = minGapSize + Math.random() * (maxGapSize - minGapSize);
    // Position within spread radius, centered around origin
    const center = Vector.create(
      Math.random() * gapSpread - gapCenter,
      Math.random() * gapSpread - gapCenter
    );
    // Random delay for staggered appearance
    const delay = Math.random() * maxGapDelay;
    
    return {
      vectors: circleVertices(gapRadius, resolution, radiusRand, rotateRand),
      center,
      delay,
    };
  });

  /**
   * Animation generator function
   * @param t Time value from 0 to 1
   * @returns Array of path vertices
   */
  const generate: ExplosionPathGenerator = (t: number) => {
    // Swirl intensity increases with time
    const currentSwirlIntensity = swirlIntensity * t;

    // Process gaps based on current time
    const gapPaths = gaps.map((gap) => {
      // Skip gaps that haven't started yet
      if (gap.delay > t) return null;
      
      // Calculate size scale with easing
      const sizeScale = easing.inOutQuint(
        Math.min(1, (t - gap.delay) * gapGrowthSpeed)
      );
      
      // Clone vectors to avoid modifying originals
      const cloned = gap.vectors.map(v => Vector.clone(v));

      // Scale and translate gap
      return Vertices.translate(
        Vertices.scale(cloned, sizeScale, sizeScale, {x: 0, y: 0}),
        gap.center,
        1,
      );
    });
    
    // we'll return an array that first contains the main explosion shape
    // then all shapes that should be 'subtracted' from it (which should
    // be done at the render stage)
    const paths = [
      mainExplosionShape,
      ...gapPaths.filter((path): path is Vector[] => path !== null && !!path.length),
    ];

    // Apply swirl effect to all paths
    const swirledPaths = paths.map(path => {
      return path.map(v => {
        const [swirledX, swirledY] = applySwirl(
          [v.x, v.y],
          swirlOrigin,
          currentSwirlIntensity,
          swirlRadius
        );
        return Vector.create(swirledX, swirledY);
      });
    });

    return swirledPaths;
  };

  // Return both the original shape and the generator function
  return {
    originalShape: mainExplosionShape,
    generate
  };
} 