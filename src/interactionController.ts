import PlayerInputSystem from "./logic/PlayerInputSystem";
import {InteractionCommand} from "./logic/PlayerActions";

/**
 * Translates DOM input events into commands on the `PlayerInputSystem`.
 *
 * This controller never mutates the simulation directly: discrete actions are
 * queued and executed at the next engine step, and the held state of the
 * primary trigger is sampled by the input system's step logic.
 */
export default (
  {
    mouseEmitter = window,
    keyEmitter = document,
    input,
    keyMap = {
      q:   'dropItem',
      b:   'buildItem',
      e:   'takeItem',
      t:   'throwItem',
      c:   'applyItem',
      '/': 'interactWithNpc',
    },
  }: {
    mouseEmitter?: EventTarget;
    keyEmitter?: EventTarget;
    input: PlayerInputSystem;
    keyMap?: Record<string, InteractionCommand>;
  }) => {

  const press = (e: KeyboardEvent) => {
    const command = keyMap[e.key];
    if (command) input.enqueueCommand(command);
  };

  const mouseDown = () => input.pressPrimary();

  const mouseUp = () => input.releasePrimary();

  keyEmitter.addEventListener('keydown', press as EventListener);

  mouseEmitter.addEventListener('mousedown', mouseDown);
  mouseEmitter.addEventListener('mouseup', mouseUp);

  return {
    destroy() {
      keyEmitter.removeEventListener('keydown', press as EventListener);
      mouseEmitter.removeEventListener('mousedown', mouseDown);
      mouseEmitter.removeEventListener('mouseup', mouseUp);
    },
  };
};
