import Throwable from '../../logic/Throwable';

import applyExplosion from '../../logic/effects/applyExplosion';

export default ({x, y, velocity}) => new Throwable({
    x,
    y,
    velocity,
    name:    'grenade',
    radius:  8,
    density: .008,
    ttl:     1500,
    trigger({position, interactionHandler}) {
        applyExplosion({
            stage:  interactionHandler.stage, ...position,
            radius: 120,
            force:  5e-2,
            rand:   .2,
        });
    }
});