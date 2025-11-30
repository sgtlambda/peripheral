import { createNoise2D } from "simplex-noise";

export type TerrainConfig = {
  /** Base height offset */
  baseHeight: number;
  /** Maximum height variation */
  amplitude: number;
  /** How quickly terrain changes (lower = smoother) */
  frequency: number;
  /** Number of noise octaves for detail */
  octaves: number;
  /** How much each octave contributes (0-1) */
  persistence: number;
  /** Random seed for reproducible terrain */
  seed?: number;
};

const DEFAULT_CONFIG: TerrainConfig = {
  baseHeight: 0,
  amplitude: 100,
  frequency: 0.005,
  octaves: 4,
  persistence: 0.5,
};

/**
 * Procedural terrain generator using simplex noise.
 * Generates smooth, infinite 1D terrain heights.
 */
export class ProceduralTerrain {
  private noise2D: ReturnType<typeof createNoise2D>;
  private config: TerrainConfig;

  constructor(config: Partial<TerrainConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Create seeded random if seed provided
    const random = this.config.seed !== undefined 
      ? this.seededRandom(this.config.seed) 
      : Math.random;
    
    this.noise2D = createNoise2D(random);
  }

  /**
   * Simple seeded random number generator
   */
  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * Get terrain height at a specific x position.
   * Uses fractal Brownian motion (fBm) for natural-looking terrain.
   */
  getHeightAt(x: number): number {
    let height = 0;
    let amplitude = this.config.amplitude;
    let frequency = this.config.frequency;

    for (let i = 0; i < this.config.octaves; i++) {
      // Use 2D noise with y=0 for 1D terrain
      const noiseValue = this.noise2D(x * frequency, i * 1000);
      height += noiseValue * amplitude;

      amplitude *= this.config.persistence;
      frequency *= 2;
    }

    return this.config.baseHeight + height;
  }

  /**
   * Sample terrain heights over a range.
   * Returns array of {x, y} points for rendering.
   */
  sample(
    startX: number,
    endX: number,
    resolution: number
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    const step = (endX - startX) / resolution;

    for (let i = 0; i <= resolution; i++) {
      const x = startX + i * step;
      points.push({ x, y: this.getHeightAt(x) });
    }

    return points;
  }

  /**
   * Get terrain height at x, with interpolation for smooth sampling
   * between discrete world positions.
   */
  getInterpolatedHeight(x: number, sampleDistance: number = 1): number {
    const x0 = Math.floor(x / sampleDistance) * sampleDistance;
    const x1 = x0 + sampleDistance;
    const t = (x - x0) / sampleDistance;

    const h0 = this.getHeightAt(x0);
    const h1 = this.getHeightAt(x1);

    // Smooth interpolation (smoothstep)
    const smoothT = t * t * (3 - 2 * t);
    return h0 + (h1 - h0) * smoothT;
  }

  /**
   * Get terrain normal (slope direction) at a point.
   * Returns angle in radians.
   */
  getSlopeAngle(x: number, sampleWidth: number = 2): number {
    const h1 = this.getHeightAt(x - sampleWidth / 2);
    const h2 = this.getHeightAt(x + sampleWidth / 2);
    return Math.atan2(h2 - h1, sampleWidth);
  }

  /**
   * Update configuration (useful for dynamic terrain changes)
   */
  setConfig(config: Partial<TerrainConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): TerrainConfig {
    return { ...this.config };
  }
}

