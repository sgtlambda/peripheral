import Throwable from '../../logic/Throwable';

import applyExplosion from '../../logic/effects/applyExplosion';
import {plasma} from '../../gradients';
import {AudioManager} from "../../common/AudioManager";
import {SoundEffectID} from "../soundEffects";

export default ({x, y, velocity}) => new Throwable({
    name: 'plasmaGrenade', x, y, radius: 20, velocity, ttl: 3000,
    trigger({position, interactionHandler}) {
        AudioManager.getInstance().playWithRandomPitch(
            SoundEffectID.EXPLOSION_LARGE,
        );
        applyExplosion({
            stage:        interactionHandler.stage, ...position,
            nomRadius:    200,
            effectRadius: 300,
            force:        1.5e-1,
            rand:         .1,
            gradient:     plasma,
            duration:     2300,
        });
        interactionHandler.stage.chiefTemporalOfficer.slowMoTemporarily(.01, 800);
    }
});