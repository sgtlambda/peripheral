import {ColorStop, ColorTuple} from "./common/colorGradient";

export const fire: ColorStop[] = [
  {color: [255, 255, 200, 1] as ColorTuple, position: 0},     // Bright yellow-white center
  {color: [255, 165, 0, 1] as ColorTuple, position: 0.1},     // Orange
  {color: [255, 0, 0, 0.9] as ColorTuple, position: 0.2},     // Red
  {color: [50, 50, 50, 0.7] as ColorTuple, position: .3}        // Dark red, semi-transparent
];

export const plasma: ColorStop[] = [
  {color: [220, 220, 255, 1] as ColorTuple, position: 0},     // Bright blue-white center
  {color: [100, 100, 255, 1] as ColorTuple, position: 0.3},   // Blue
  {color: [180, 0, 255, 0.9] as ColorTuple, position: 0.7},   // Purple
  {color: [80, 0, 80, 0.5] as ColorTuple, position: 1}        // Dark purple, semi-transparent
];

export const toxic: ColorStop[] = [
  {color: [200, 255, 200, 1] as ColorTuple, position: 0},     // Bright green-white center
  {color: [0, 255, 0, 1] as ColorTuple, position: 0.3},       // Green
  {color: [0, 100, 0, 0.8] as ColorTuple, position: 0.7},     // Dark green
  {color: [0, 50, 0, 0.5] as ColorTuple, position: 1}         // Very dark green, semi-transparent
];