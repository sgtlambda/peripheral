import {Vector} from "matter-js";

import {ItemIntent} from "../../logic/ItemIntent";

export const debugDrawGlobal: { path: Vector[] } = {path: []};

declare global {
  interface Window {
    debugDrawGlobal: { path: Vector[] }; // Expose for debugging
  }
}

window.debugDrawGlobal = debugDrawGlobal;

export const INTENT_DEBUG_DRAW = Symbol('INTENT_DEBUG_DRAW');

export default (
  {
    primary = true,
  }: {
    primary?: boolean;
  } = {}): ItemIntent => ({
  primary,
  type:        INTENT_DEBUG_DRAW,
  description: 'draw [lmb]',
  options:     {},
  trigger({player}) {
    const gameMouse = player.mouse;
    debugDrawGlobal.path.push({
      x: Math.round(gameMouse.x * 10) / 10,
      y: Math.round(gameMouse.y * 10) / 10,
    });
  },
});
