import {findIndex} from 'lodash';

import PlayerState from './logic/PlayerState';

export default (
  {
    emitter = document,
    playerState,
  }: {
    emitter?: EventTarget;
    playerState: PlayerState;
  }) => {

  const press = (e: KeyboardEvent) => {
    const index = findIndex(playerState.inventory, {keyBind: e.key});
    if (index !== -1) playerState.selectSlot(index);
  };

  emitter.addEventListener('keydown', press as EventListener);

  return {
    destroy() {
      emitter.removeEventListener('keydown', press as EventListener);
    },
  };
};
