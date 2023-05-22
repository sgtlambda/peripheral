import Throwable from '../../logic/Throwable';

import applyExplosion from '../../logic/effects/applyExplosion';

export default ({x, y, velocity}) => new Throwable({
    name: 'nuke', x, y, velocity, countdown: 180,
    trigger({position, interactionHandler}) {
        applyExplosion({
            stage:  interactionHandler.stage, ...position,
            radius: 300,
            force:  1.5e-1,
            rand:  .1,
        });
    }
})