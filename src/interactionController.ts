import InteractionHandler, {InteractionCommand} from "./logic/InteractionHandler";

/**
 * Translates DOM input events into commands on the `InteractionHandler`.
 *
 * This controller never mutates the simulation directly: discrete actions are
 * queued and executed at the next engine step, and the held state of the
 * primary trigger is sampled by the handler's step logic (which also paces
 * continuous fire on the simulation clock — no `setInterval`).
 */
export default (
  {
    mouseEmitter = window,
    keyEmitter = document,
    interactionHandler,
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
    interactionHandler: InteractionHandler;
    keyMap?: Record<string, InteractionCommand>;
  }) => {

  const press = (e: KeyboardEvent) => {
    const command = keyMap[e.key];
    if (command) interactionHandler.enqueueCommand(command);
  };

  const mouseDown = () => interactionHandler.pressPrimary();

  const mouseUp = () => interactionHandler.releasePrimary();

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
