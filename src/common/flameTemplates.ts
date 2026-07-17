import {FlameGeneratorConfig} from "./butaneFlame";

/**
 * A named flame preset: a solid colour plus a reach-independent config (all
 * sizes are ratios of reach, so the same template works at any scale).
 */
export type FlameTemplate = {
  name: string;
  color: string;
  /** Config overrides, minus `reach`/`direction`/`random`, which the caller supplies. */
  config: Omit<Partial<FlameGeneratorConfig>, "reach" | "direction" | "random">;
};

export const flameTemplates: FlameTemplate[] = [
  {
    name:  "Butane Torch",
    color: "rgb(120,170,255)",
    config: {
      bodyCount: 40, spread: 0.18, nozzleWidthRatio: 0.18, bodyLengthRatio: 0.2,
      bodyTaperStart: 0.4, holeCount: 7, holeSpanRatio: 0.18, holeThickness: 0.6,
      holeSpawnDist: 0.38, holeDriftDist: 0.18,
    },
  },
  {
    name:  "Blowtorch",
    color: "rgb(205,228,255)",
    config: {
      bodyCount: 46, spread: 0.12, nozzleWidthRatio: 0.12, bodyLengthRatio: 0.24,
      bodyTaperStart: 0.55, lensAspect: 0.45, flickerRatio: 0.015,
      holeCount: 6, holeSpanRatio: 0.16, holeThickness: 0.5, holeSpawnDist: 0.45,
      holeSizeEasing: "inOutExpo", holeDriftDist: 0.12,
    },
  },
  {
    name:  "Roaring Jet",
    color: "rgb(110,160,255)",
    config: {
      bodyCount: 54, spread: 0.4, nozzleWidthRatio: 0.42, bodyLengthRatio: 0.18,
      bodyTaperStart: 0.3, holeCount: 12, holeSpanRatio: 0.26, holeThickness: 0.8,
      holeSpread: 0.42, holeSpawnDist: 0.3, holeSizeEasing: "outQuart", holeDriftDist: 0.28,
      flickerRatio: 0.05,
    },
  },
  {
    name:  "Candle",
    color: "rgb(255,183,92)",
    config: {
      bodyCount: 30, spread: 0.14, nozzleWidthRatio: 0.16, bodyLengthRatio: 0.22,
      bodyTaperStart: 0.25, bodySpeed: 0.6, lensAspect: 0.7,
      holeCount: 3, holeSpanRatio: 0.12, holeThickness: 0.9, holeSpeed: 0.6,
      holeSpawnDist: 0.4, holeSizeEasing: "outCubic", holeDriftDist: 0.15, flickerRatio: 0.04,
    },
  },
  {
    name:  "Pilot Light",
    color: "rgb(150,200,255)",
    config: {
      bodyCount: 24, spread: 0.12, nozzleWidthRatio: 0.12, bodyLengthRatio: 0.18,
      bodyTaperStart: 0.45, holeCount: 3, holeSpanRatio: 0.12, holeThickness: 0.7,
      holeSpawnDist: 0.42, holeDriftDist: 0.1,
    },
  },
  {
    name:  "Wispy Tongues",
    color: "rgb(140,182,255)",
    config: {
      bodyCount: 44, spread: 0.34, nozzleWidthRatio: 0.28, bodyLengthRatio: 0.16,
      bodyTaperStart: 0.3, holeCount: 14, holeSpanRatio: 0.13, holeThickness: 0.4,
      holeSpread: 0.36, holeSpawnDist: 0.3, holeDriftDist: 0.24,
      flickerRatio: 0.06, flickerFreq: 3,
    },
  },
  {
    name:  "Inferno",
    color: "rgb(130,175,255)",
    config: {
      bodyCount: 56, spread: 0.42, nozzleWidthRatio: 0.4, bodyLengthRatio: 0.2,
      bodyTaperStart: 0.28, holeCount: 12, holeSpanRatio: 0.28, holeThickness: 0.85,
      holeSpread: 0.44, holeSpawnDist: 0.28, holeSizeEasing: "outQuart", holeDriftDist: 0.32,
      flickerRatio: 0.05, holeSpeed: 1.3,
    },
  },
  {
    name:  "Plasma Cutter",
    color: "rgb(198,120,255)",
    config: {
      bodyCount: 46, spread: 0.16, nozzleWidthRatio: 0.14, bodyLengthRatio: 0.24,
      bodyTaperStart: 0.5, lensAspect: 0.5, holeCount: 8, holeSpanRatio: 0.16,
      holeThickness: 0.45, holeSpread: 0.2, holeSpawnDist: 0.4, holeSizeEasing: "inOutExpo",
      holeDriftDist: 0.14, flickerRatio: 0.02,
    },
  },
  {
    name:  "Drifting Ember",
    color: "rgb(255,124,66)",
    config: {
      bodyCount: 34, spread: 0.3, nozzleWidthRatio: 0.26, bodyLengthRatio: 0.17,
      bodyTaperStart: 0.5, bodySpeed: 0.7, holeCount: 9, holeSpanRatio: 0.2,
      holeThickness: 0.9, holeSpeed: 0.7, holeSpawnDist: 0.32, holeSizeEasing: "outCubic",
      holeDriftDist: 0.4, flickerRatio: 0.05,
    },
  },
  {
    name:  "Split Fork",
    color: "rgb(120,165,255)",
    config: {
      bodyCount: 38, spread: 0.34, nozzleWidthRatio: 0.34, bodyLengthRatio: 0.19,
      bodyTaperStart: 0.32, holeCount: 5, holeSpanRatio: 0.26, holeThickness: 0.55,
      holeSpread: 0.1, holeSpawnDist: 0.34, holeDriftDist: 0.22,
    },
  },
];

export const defaultFlameTemplate = flameTemplates[0];
