import Throwable from '../../logic/Throwable';

import boom from '../../logic/effects/boom';

export default ({x, y, velocity}) => new Throwable({
    name: 'nuke', x, y, velocity, countdown: 180,
    trigger({position, interactionHandler}) {
        boom({
            stage:  interactionHandler.stage, ...position,
            radius: 300,
            force:  1.5e-1,
        });
    }
})