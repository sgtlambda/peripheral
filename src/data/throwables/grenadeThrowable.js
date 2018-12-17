import Throwable from '../../logic/Throwable';

import boom from '../../logic/effects/boom';

export default ({x, y, velocity}) => new Throwable({
    name: 'grenade', x, y, velocity, countdown: 80,
    trigger({position, interactionHandler}) {
        boom({stage: interactionHandler.stage, ...position, radius: 100, force: 1.5e-2});
    }
})