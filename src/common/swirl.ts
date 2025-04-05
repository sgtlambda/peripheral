/**
 * Applies a swirl transform to a 2D vector
 * @param vector - The input 2D vector [x, y]
 * @param origin - The center point of the swirl [x, y]
 * @param intensity - Controls the amount of rotation (radians per unit distance)
 * @param radius - Controls how quickly the effect falls off with distance
 * @returns The transformed 2D vector
 */
export function applySwirl(
  vector: [number, number], 
  origin: [number, number], 
  intensity: number, 
  radius: number
): [number, number] {
  const [x, y] = vector;
  const [originX, originY] = origin;
  
  // Calculate the vector relative to the origin
  const relX = x - originX;
  const relY = y - originY;
  
  // Calculate distance from origin
  const distance = Math.sqrt(relX * relX + relY * relY);
  
  // Calculate the rotation angle based on distance and intensity
  // The effect decreases as distance increases beyond the radius
  const angle = intensity * Math.exp(-distance / radius);
  
  // Apply rotation using 2D rotation matrix
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  
  // Rotate the vector around the origin
  const rotatedX = relX * cosAngle - relY * sinAngle;
  const rotatedY = relX * sinAngle + relY * cosAngle;
  
  // Translate back to the original coordinate system
  return [rotatedX + originX, rotatedY + originY];
} 