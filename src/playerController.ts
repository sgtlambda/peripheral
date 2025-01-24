import {Controller, KeyMap, KeysOn} from "./types";

const playerController = (
  {
    emitter = document,
    keyMap = {
      a: 'left',
      d: 'right',
      w: 'up',
      s: 'down',
    },
  }: {
    emitter?: EventTarget;
    keyMap?: KeyMap;
  } = {}): Controller<{
  keysOn: KeysOn;
}> => {

  const keysOn: KeysOn = {};

  const press = (e: KeyboardEvent) => {
    if (e.key in keyMap) keysOn[keyMap[e.key]] = true;
  };

  const release = (e: KeyboardEvent) => {
    if (e.key in keyMap) keysOn[keyMap[e.key]] = false;
  };

  emitter.addEventListener('keydown', press as EventListener);
  emitter.addEventListener('keyup', release as EventListener);

  return {
    keysOn,
    destroy() {
      emitter.removeEventListener('keydown', press as EventListener);
      emitter.removeEventListener('keyup', release as EventListener);
    },
  };
};

export default playerController;