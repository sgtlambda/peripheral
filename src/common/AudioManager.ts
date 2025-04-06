/**
 * Simple audio manager for loading and playing sound effects
 */
export class AudioManager {
  private static instance: AudioManager;
  private soundsMap: Map<string, HTMLAudioElement> = new Map();
  private initialized: boolean = false;
  private enabled: boolean = true;

  /**
   * Get the singleton instance
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize the audio manager
   * @param sounds Object mapping sound IDs to file paths
   */
  public init(sounds: Record<string, string>): void {
    if (this.initialized) {
      console.warn('AudioManager already initialized');
      return;
    }

    // Pre-load all sounds
    Object.entries(sounds).forEach(([id, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.soundsMap.set(id, audio);
    });

    this.initialized = true;
  }

  /**
   * Enable or disable all sounds
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Play a sound effect
   * @param id The sound ID to play
   * @param volume Optional volume (0.0 to 1.0)
   * @param rate Optional playback rate (1.0 is normal speed)
   * @returns Promise that resolves when the sound has finished playing
   */
  public play(id: string, volume: number = 1.0, rate: number = 1.0): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    
    const sound = this.soundsMap.get(id);
    if (!sound) {
      console.warn(`Sound "${id}" not found`);
      return Promise.resolve();
    }

    // Create a new audio element from the original source
    // This allows for multiple simultaneous playbacks of the same sound
    const playSound = new Audio(sound.src);
    playSound.volume = Math.max(0, Math.min(1, volume));
    playSound.playbackRate = rate;
    playSound.preservesPitch = false;

    return new Promise<void>((resolve) => {
      playSound.onended = () => resolve();
      playSound.play().catch(error => {
        console.error(`Error playing sound "${id}":`, error);
        resolve();
      });
    });
  }

  /**
   * Play a sound with random pitch variation
   * @param id The sound ID to play
   * @param volume Base volume (0.0 to 1.0)
   * @param minPitch Minimum pitch multiplier (e.g., 0.8 for 20% lower)
   * @param maxPitch Maximum pitch multiplier (e.g., 1.2 for 20% higher)
   */
  public playWithRandomPitch(
    id: string, 
    volume: number = 1.0, 
    minPitch: number = 0.8,
    maxPitch: number = 1.1,
  ): Promise<void> {
    const rate = minPitch + Math.random() * (maxPitch - minPitch);
    return this.play(id, volume, rate);
  }
} 