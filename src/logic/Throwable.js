import {Body, Bodies} from 'matter-js';

import debugRender from '../data/debugRender';

import {cItems, cTerrain} from '../data/collisionGroups';

class Throwable {

    constructor({name, x, y, velocity = null, trigger, countdown = 120}) {
        // this.itemType = itemType;
        this.name      = name;
        this.countdown = countdown;
        this.trigger   = trigger;
        this.prepareBodies({x, y, velocity});
    }

    prepareBodies({x, y, velocity = null, radius = 8}) {
        this.collider = Bodies.circle(x, y, radius, {
            restitution:     .5,
            inertia:         Infinity,
            render:          debugRender,
            collisionFilter: {
                category: cItems,
                mask:     cTerrain | cItems,
            }
        });
        if (velocity) {
            Body.setVelocity(this.collider, velocity);
        }
    }

    get position() {
        return this.collider.position;
    }

    step(interactionHandler) {
        this.countdown -= 1;
        if (this.countdown <= 0) {
            this.trigger({position: {...this.position}, throwable: this, interactionHandler});
            interactionHandler.stage.removeThrowable(this);
        }
    }
}

export default Throwable;