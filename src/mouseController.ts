import {Engine, Events, Vector} from 'matter-js';

import Camera from './rendering/Camera';

export default (
  {
    emitter = window,
    camera,
    engine,
  }: {
    emitter?: EventTarget;
    camera: Camera;
    engine: Engine;
  }) => {

  const screenMouse: Vector = {x: 0, y: 0};
  const gameMouse: Vector   = {x: 0, y: 0};

  const mousemove = (e: MouseEvent) => {
    screenMouse.x = e.pageX;
    screenMouse.y = e.pageY;
  };

  const updateGameMouse = () => {
    const bounds = camera.bounds;

    const _gameMouseRotate = Vector.rotateAbout(screenMouse, 0, camera.onscreenCenter);

    const _gameMouse = Vector.add(_gameMouseRotate, bounds.min);

    gameMouse.x = _gameMouse.x;
    gameMouse.y = _gameMouse.y;
  };

  Events.on(engine, 'beforeUpdate', updateGameMouse);

  emitter.addEventListener('mousemove', mousemove as EventListener);

  return {
    screenMouse,
    gameMouse,
    destroy() {
      emitter.removeEventListener('mousemove', mousemove as EventListener);
      Events.off(engine, 'beforeUpdate', updateGameMouse);
    },
  };
};
