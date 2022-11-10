import Throwable from '../../logic/Throwable';

import applyExplosion from '../../logic/effects/applyExplosion';

export default ({x, y, velocity}) => new Throwable({
    name: 'drill', x, y, velocity, countdown: 0,
    trigger({position, interactionHandler}) {
        applyExplosion({
            resolution: 6,
            rand:       .2,
            stage:      interactionHandler.stage,
            radius:     30,
            force:      0,
            ...position,
        });
    }
})