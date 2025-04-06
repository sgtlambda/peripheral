# Audio System

This document provides an overview of the audio system implemented in the game.

## How to Use

### Playing Sound Effects

To play a sound effect in your code:

```typescript
import {AudioManager} from './common/AudioManager';
import {SoundEffectID} from './data/soundEffects';

// Play a simple sound effect
AudioManager.getInstance().play(SoundEffectID.EXPLOSION_LARGE);

// Play with custom volume
AudioManager.getInstance().play(SoundEffectID.IMPACT, 0.7);

// Play with random pitch variation (for more natural sounds)
AudioManager.getInstance().playWithRandomPitch(
  SoundEffectID.EXPLOSION_SMALL, 
  0.6, // volume
  0.9, // minimum pitch
  1.1  // maximum pitch
);
```

### Adding New Sound Effects

1. Add the sound file to the `/public/sounds/` directory (create it if it doesn't exist)
2. Update the `SoundEffectID` enum and `soundEffectPaths` in `src/data/soundEffects.ts`

```typescript
// In src/data/soundEffects.ts
export enum SoundEffectID {
  // Existing sound effects...
  MY_NEW_SOUND = 'my-new-sound',
}

export const soundEffectPaths: Record<SoundEffectID, string> = {
  // Existing paths...
  [SoundEffectID.MY_NEW_SOUND]: '/sounds/my-new-sound.mp3',
};

// Optionally set a default volume
export const soundEffectVolumes: Partial<Record<SoundEffectID, number>> = {
  // Existing volumes...
  [SoundEffectID.MY_NEW_SOUND]: 0.5,
};
```

## Implementation Details

The audio system uses a singleton `AudioManager` class to:

1. Pre-load sound effects at game initialization
2. Play sound effects with volume and pitch control
3. Enable/disable all sounds with a single method call

## Tips for Good Sound Design

1. **Use appropriate volume levels** - Explosions should be louder than footsteps
2. **Add randomness to sounds** - Use `playWithRandomPitch` to add variations to repeated sounds
3. **Match sound with visuals** - Synchronize sounds with visual effects for maximum impact
4. **Sound distance falloff** - For future enhancement, add volume reduction based on distance from the player

## Supported Audio Formats

Most browsers support:
- MP3
- WAV
- OGG

For optimal compatibility across browsers, MP3 is recommended. 