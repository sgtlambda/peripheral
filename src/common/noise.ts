/**
 * Deterministic 2D value noise. Pure functions of (x, y, seed): the same world
 * position always yields the same value, so patterns built on it stay fixed to
 * the world as things move over them.
 */

/** Integer-lattice hash to [0, 1). */
function hash2(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 0x27d4eb2d) ^ Math.imul(iy, 0x165667b1) ^ Math.imul(seed, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Smoothly interpolated value noise in [0, 1), with a feature size of 1 unit. */
export function valueNoise(x: number, y: number, seed = 0): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = smooth(x - ix), fy = smooth(y - iy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/**
 * Fractal (fBm) value noise in [0, 1): `octaves` layers, each at double the
 * frequency and half the weight of the last.
 */
export function fbm(x: number, y: number, octaves = 3, seed = 0): number {
  let sum = 0, weight = 1, total = 0, freq = 1;
  for (let o = 0; o < octaves; o++) {
    sum    += valueNoise(x * freq, y * freq, seed + o * 101) * weight;
    total  += weight;
    weight *= 0.5;
    freq   *= 2;
  }
  return sum / total;
}

/** Integer-lattice hash to [0, 1), in three dimensions. */
function hash3(ix: number, iy: number, iz: number, seed: number): number {
  return hash2(ix ^ Math.imul(iz, 0x5bd1e995), iy + Math.imul(iz, 0x1b873593), seed);
}

/** Smoothly interpolated 3D value noise in [0, 1). Use z as time for a 2D pattern that evolves in place. */
export function valueNoise3(x: number, y: number, z: number, seed = 0): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = smooth(x - ix), fy = smooth(y - iy), fz = smooth(z - iz);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const plane = (k: number) => lerp(
    lerp(hash3(ix, iy, k, seed), hash3(ix + 1, iy, k, seed), fx),
    lerp(hash3(ix, iy + 1, k, seed), hash3(ix + 1, iy + 1, k, seed), fx),
    fy,
  );
  return lerp(plane(iz), plane(iz + 1), fz);
}

/** Fractal (fBm) 3D value noise in [0, 1); see `fbm`. */
export function fbm3(x: number, y: number, z: number, octaves = 3, seed = 0): number {
  let sum = 0, weight = 1, total = 0, freq = 1;
  for (let o = 0; o < octaves; o++) {
    sum    += valueNoise3(x * freq, y * freq, z * freq, seed + o * 101) * weight;
    total  += weight;
    weight *= 0.5;
    freq   *= 2;
  }
  return sum / total;
}
