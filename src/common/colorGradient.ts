/**
 * A color represented as [r, g, b, a] with values between 0-255 for RGB and 0-1 for alpha
 */
export type ColorTuple = [number, number, number, number];

/**
 * A color stop in a gradient
 */
export type ColorStop = {
  /** The color as [r, g, b, a] */
  color: ColorTuple;
  /** The position in the gradient (0-1) */
  position: number;
};

/**
 * Linearly interpolates between two values
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolates between two colors based on a position (0-1)
 */
function interpolateColors(colorA: ColorTuple, colorB: ColorTuple, t: number): ColorTuple {
  return [
    lerp(colorA[0], colorB[0], t),
    lerp(colorA[1], colorB[1], t),
    lerp(colorA[2], colorB[2], t),
    lerp(colorA[3], colorB[3], t)
  ];
}

/**
 * Gets a color from a gradient at a specific position
 * 
 * @param gradient Array of color stops with colors as [r,g,b,a] and positions (0-1)
 * @param position Position in the gradient (0-1)
 * @returns Interpolated color as [r,g,b,a]
 * 
 * @example
 * // Green at start, red in middle, black at end
 * const gradient = [
 *   { color: [0, 255, 0, 1], position: 0 },   // Green
 *   { color: [255, 0, 0, 1], position: 0.5 }, // Red
 *   { color: [0, 0, 0, 0.5], position: 1 }    // Semi-transparent black
 * ];
 * const color = getGradientColor(gradient, 0.25); // Halfway between green and red
 */
export function getGradientColor(gradient: ColorStop[], position: number): ColorTuple {
  // Clamp position between 0 and 1
  position = Math.max(0, Math.min(1, position));
  
  // Sort gradient by position if not already sorted
  const sortedGradient = [...gradient].sort((a, b) => a.position - b.position);
  
  // Handle edge cases
  if (position <= sortedGradient[0].position) {
    return sortedGradient[0].color;
  }
  
  if (position >= sortedGradient[sortedGradient.length - 1].position) {
    return sortedGradient[sortedGradient.length - 1].color;
  }
  
  // Find the two color stops that our position falls between
  for (let i = 0; i < sortedGradient.length - 1; i++) {
    const currentStop = sortedGradient[i];
    const nextStop = sortedGradient[i + 1];
    
    if (position >= currentStop.position && position <= nextStop.position) {
      // Calculate how far we are between the two stops (0-1)
      const t = (position - currentStop.position) / (nextStop.position - currentStop.position);
      
      // Interpolate between the two colors
      return interpolateColors(currentStop.color, nextStop.color, t);
    }
  }
  
  // Fallback - should never reach here if the gradient is valid
  return [0, 0, 0, 1];
}

/**
 * Converts a color tuple to a CSS rgba string
 */
export function colorTupleToRgba(color: ColorTuple): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
} 