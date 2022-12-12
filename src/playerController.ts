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

  const press = e => {
    if (e.key in keyMap) keysOn[keyMap[e.key]] = true;
  };

  const release = e => {
    if (e.key in keyMap) keysOn[keyMap[e.key]] = false;
  };

  emitter.addEventListener('keydown', press);
  emitter.addEventListener('keyup', release);

  return {
    keysOn,
    destroy() {
      emitter.removeEventListener('keydown', press);
      emitter.removeEventListener('keyup', release);
    },
  };
};

export default playerController;