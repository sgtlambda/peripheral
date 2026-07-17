import {ColorStop, ColorTuple} from "./common/colorGradient";

export const fire: ColorStop[] = [
  {color: [255, 255, 100, 1] as ColorTuple, position: 0},     // Bright yellow-white center
  {color: [255, 255, 255, 1] as ColorTuple, position: 0.15},     // White "flash"
  {color: [255, 0, 0, 0.9] as ColorTuple, position: 0.25},     // Red
  {color: [70, 70, 70, 0.8] as ColorTuple, position: .3}
];

export const plasma: ColorStop[] = [
  {color: [0, 0, 0, 1] as ColorTuple, position: 0},
  {color: [255, 255, 255, 1] as ColorTuple, position: 0.1},
  {color: [100, 100, 255, 1] as ColorTuple, position: 0.3},
  {color: [180, 0, 255, 0.9] as ColorTuple, position: 0.7},   // Purple
  {color: [120, 255, 120, 0.7] as ColorTuple, position: 1}        // Dark purple, semi-transparent
];

export const butane: ColorStop[] = [
  {color: [220, 240, 255, 1] as ColorTuple, position: 0},      // Pale blue-white core at the nozzle
  {color: [130, 190, 255, 0.95] as ColorTuple, position: 0.25}, // Bright blue
  {color: [60, 110, 245, 0.8] as ColorTuple, position: 0.55},   // Vivid blue body
  {color: [255, 190, 110, 0.35] as ColorTuple, position: 0.82}, // Flickering orange tip
  {color: [255, 150, 70, 0] as ColorTuple, position: 1}         // Fades to transparent
];

export const toxic: ColorStop[] = [
  {color: [200, 255, 200, 1] as ColorTuple, position: 0},     // Bright green-white center
  {color: [0, 255, 0, 1] as ColorTuple, position: 0.3},       // Green
  {color: [0, 100, 0, 0.8] as ColorTuple, position: 0.7},     // Dark green
  {color: [0, 50, 0, 0.5] as ColorTuple, position: 1}         // Very dark green, semi-transparent
];