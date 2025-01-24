import {KeyMap, KeysOn} from "./types";

const CONTINUOUS_INTERVAL = 80;

export default (
  {
    mouseEmitter = window,
    keyEmitter = document,
    interactionHandler,
    keyMap = {
      // The values here map to methods in the InteractionHandler class
      q: 'dropItem',
      b: 'buildItem',
      e: 'takeItem',
      t: 'throwItem',
      c: 'applyItem',
      f: 'interactWithNpc',
    },
  }: {
    mouseEmitter?: EventTarget;
    keyEmitter?: EventTarget;
    interactionHandler: any; // TODO ts-ify `InteractionHandler`
    keyMap?: KeyMap;
  }) => {

  const keysOn: KeysOn = {};

  const press = (e: KeyboardEvent) => {
    const method = keyMap[e.key];
    if (method && interactionHandler[method])
      interactionHandler[method].call(interactionHandler);
  };

  let _triggerContinuous: any;

  const mouseDown = () => {
    interactionHandler.triggerPrimary();
    _triggerContinuous = setInterval(() => interactionHandler.triggerContinuous(), CONTINUOUS_INTERVAL);
  };

  const mouseUp = () => {
    clearInterval(_triggerContinuous);
  };

  keyEmitter.addEventListener('keydown', press as EventListener);

  mouseEmitter.addEventListener('mousedown', mouseDown);
  mouseEmitter.addEventListener('mouseup', mouseUp);

  return {
    keysOn,
    destroy() {
      keyEmitter.removeEventListener('keydown', press as EventListener);
      mouseEmitter.removeEventListener('mousedown', mouseDown);
      mouseEmitter.removeEventListener('mouseup', mouseUp);
    },
  };
};