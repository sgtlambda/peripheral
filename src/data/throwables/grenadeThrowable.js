import Throwable from '../../logic/Throwable';

import applyExplosion from '../../logic/effects/applyExplosion';

export default ({x, y, velocity}) => new Throwable({
    name: 'grenade', x, y, velocity, ttl: 1000,
    trigger({position, interactionHandler}) {
        applyExplosion({
            stage:  interactionHandler.stage, ...position,
            radius: 70,
            force:  1.5e-2,
            rand: .2,
        });
    }
})