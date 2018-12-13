import {findIndex} from 'lodash';

export default ({
    emitter = document,
    playerState,
} = {}) => {

    const press = e => {
        const index = findIndex(playerState.inventory, {keyBind: e.key});
        if (index !== -1) playerState.selectSlot(index);
    };

    emitter.addEventListener('keydown', press);

    return {
        destroy() {
            emitter.removeEventListener('keydown', press);
        }
    };
};