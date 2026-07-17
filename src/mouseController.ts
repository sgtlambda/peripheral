import {Vector} from 'matter-js';

import Camera from './rendering/Camera';
import {System} from './types';

/**
 * Captures the on-screen mouse position from the DOM and exposes a `system`
 * that converts it to world space each step (the conversion depends on the
 * camera bounds, so it belongs in the game loop, not in the event handler).
 */
export default (
  {
    emitter = window,
    camera,
  }: {
    emitter?: EventTarget;
    camera: Camera;
  }) => {

  const screenMouse: Vector = {x: 0, y: 0};
  const gameMouse: Vector   = {x: 0, y: 0};

  const mousemove = (e: MouseEvent) => {
    screenMouse.x = e.pageX;
    screenMouse.y = e.pageY;
  };

  const system: System = {
    step() {
      const bounds = camera.bounds;

      const _gameMouseRotate = Vector.rotateAbout(screenMouse, 0, camera.onscreenCenter);

      const _gameMouse = Vector.add(_gameMouseRotate, bounds.min);

      gameMouse.x = _gameMouse.x;
      gameMouse.y = _gameMouse.y;
    },
  };

  emitter.addEventListener('mousemove', mousemove as EventListener);

  return {
    screenMouse,
    gameMouse,
    system,
    destroy() {
      emitter.removeEventListener('mousemove', mousemove as EventListener);
    },
  };
};
