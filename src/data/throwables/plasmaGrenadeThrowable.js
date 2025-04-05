import Throwable from '../../logic/Throwable';

import applyExplosion from '../../logic/effects/applyExplosion';
import {plasma} from '../../gradients';

export default ({x, y, velocity}) => new Throwable({
    name: 'plasmaGrenade', x, y, radius: 20, velocity, ttl: 3000,
    trigger({position, interactionHandler}) {
        applyExplosion({
            stage:        interactionHandler.stage, ...position,
            nomRadius:    200,
            effectRadius: 300,
            force:        1.5e-1,
            rand:         .1,
            gradient:     plasma,
        });
    }
});