/** Anything quieter than this fraction of a sound's peak counts as lead-in silence and is skipped. */
const ONSET_THRESHOLD = 0.01;

type LoadedSound = {
  buffer: AudioBuffer;
  /** Seconds of inaudible lead-in to skip, so playback starts on the sound itself */
  onset: number;
};

/**
 * Audio manager for sound effects and background music.
 *
 * Sound effects go through the Web Audio API: every file is fetched and decoded
 * into memory once, up front, and each play starts a fresh buffer source from
 * that decoded audio — nothing to fetch, decode or buffer at trigger time, so
 * effects start within a few milliseconds. (Creating an `<audio>` element per
 * play, as this used to, adds a variable delay of tens to hundreds of ms.)
 *
 * Background music stays an `<audio>` element: it's long, latency doesn't
 * matter, and streaming beats decoding the whole track into memory.
 */
export class AudioManager {
  private static instance: AudioManager;
  private readonly context: AudioContext;
  private readonly master: GainNode;
  private paths: Map<string, string> = new Map();
  private sounds: Map<string, LoadedSound> = new Map();
  private initialized: boolean = false;
  private enabled: boolean = true;
  private backgroundMusic: HTMLAudioElement | null = null;

  private constructor() {
    this.context = new AudioContext({latencyHint: 'interactive'});
    this.master  = this.context.createGain();
    this.master.connect(this.context.destination);
  }

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
   * Initialize the audio manager: starts fetching and decoding every sound
   * effect. Effects triggered before their sound has decoded are skipped.
   * @param sounds Object mapping sound IDs to file paths
   * @param streamed IDs that are only ever streamed (background music), so
   *   they're never decoded into memory
   */
  public init(sounds: Record<string, string>, streamed: string[] = []): void {
    if (this.initialized) {
      console.warn('AudioManager already initialized');
      return;
    }
    this.initialized = true;
    this.paths = new Map(Object.entries(sounds));

    Object.entries(sounds).forEach(([id, path]) => {
      if (streamed.includes(id)) return;
      fetch(path)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.arrayBuffer();
        })
        .then(data => this.context.decodeAudioData(data))
        .then(buffer => this.sounds.set(id, {buffer, onset: findOnset(buffer)}))
        .catch(error => console.warn(`Sound "${id}" (${path}) failed to load:`, error));
    });

    this.unlockOnFirstGesture();
  }

  /**
   * Browsers keep an AudioContext suspended until the page gets a user gesture.
   * Resume it on the first one, so the first effect isn't lost or delayed.
   */
  private unlockOnFirstGesture(): void {
    const events = ['pointerdown', 'keydown', 'touchstart'];
    const unlock = () => {
      this.context.resume().then(() => {
        if (this.context.state === 'running') events.forEach(e => window.removeEventListener(e, unlock, true));
      });
    };
    events.forEach(e => window.addEventListener(e, unlock, true));
  }

  /**
   * Enable or disable all sounds
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.master.gain.value = enabled ? 1 : 0;
    if (this.backgroundMusic) {
      this.backgroundMusic.muted = !enabled;
    }
  }

  /**
   * Play a sound effect
   * @param id The sound ID to play
   * @param volume Optional volume (0.0 to 1.0)
   * @param rate Optional playback rate (1.0 is normal speed; pitch shifts with it)
   * @returns Promise that resolves when the sound has finished playing
   */
  public play(id: string, volume: number = 1.0, rate: number = 1.0): Promise<void> {
    if (!this.enabled) return Promise.resolve();

    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Sound "${id}" not loaded`);
      return Promise.resolve();
    }

    if (this.context.state === 'suspended') this.context.resume();

    const source = this.context.createBufferSource();
    source.buffer             = sound.buffer;
    source.playbackRate.value = rate;

    const gain = this.context.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume));

    source.connect(gain);
    gain.connect(this.master);

    return new Promise<void>(resolve => {
      source.onended = () => {
        gain.disconnect();
        resolve();
      };
      source.start(0, sound.onset);
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
    minPitch: number = 0.9,
    maxPitch: number = 1.1,
  ): Promise<void> {
    const rate = minPitch + Math.random() * (maxPitch - minPitch);
    return this.play(id, volume, rate);
  }

  /**
   * Start playing background music
   * @param id The sound ID of the background music
   * @param volume Optional volume (0.0 to 1.0)
   */
  public playBackgroundMusic(id: string, volume: number = 1.0): void {
    if (!this.enabled) return;

    const path = this.paths.get(id);
    if (!path) {
      console.warn(`Background music "${id}" not found`);
      return;
    }

    // Stop any existing background music
    this.stopBackgroundMusic();

    this.backgroundMusic = new Audio(path);
    this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    this.backgroundMusic.loop = true;
    this.backgroundMusic.play().catch(error => {
      console.error(`Error playing background music "${id}":`, error);
    });
  }

  /**
   * Stop the currently playing background music
   */
  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic = null;
    }
  }
}

/**
 * Seconds before the sound first reaches `ONSET_THRESHOLD` of its peak — the
 * encoder padding and near-silent lead-in that would otherwise play as a delay.
 */
function findOnset(buffer: AudioBuffer): number {
  const channels = Array.from({length: buffer.numberOfChannels}, (_, c) => buffer.getChannelData(c));
  let peak = 0;
  for (const data of channels) for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  if (peak === 0) return 0;

  const threshold = peak * ONSET_THRESHOLD;
  for (let i = 0; i < buffer.length; i++) {
    if (channels.some(data => Math.abs(data[i]) > threshold)) return i / buffer.sampleRate;
  }
  return 0;
}
