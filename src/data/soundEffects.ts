/**
 * Sound effect definitions for the game
 */

// Define sound effect IDs
export enum SoundEffectID {
  EXPLOSION_LARGE = 'explosion-large',
  EXPLOSION_SMALL = 'explosion-small',
  IMPACT = 'impact',
  THROW = 'throw',
}

// Map of sound effects paths
// These should be placed in the public directory
export const soundEffectPaths: Record<SoundEffectID, string> = {
  [SoundEffectID.EXPLOSION_LARGE]: '/sounds/explosion-large.mp3',
  [SoundEffectID.EXPLOSION_SMALL]: '/sounds/explosion-small.mp3',
  [SoundEffectID.IMPACT]: '/sounds/impact.mp3',
  [SoundEffectID.THROW]: '/sounds/throw.mp3',
};