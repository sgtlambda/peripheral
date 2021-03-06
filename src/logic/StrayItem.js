import {Body, Bodies} from 'matter-js';

import debugRender from '../data/debugRender';

import {cItems, cTerrain} from "../data/collisionGroups";

class StrayItem {

    constructor({itemType, x, y, velocity = null, cooldown = 0}) {
        this.itemType = itemType;
        this.cooldown = cooldown;
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

    step() {
        if (this.cooldown > 0) this.cooldown -= 1;
    }
}

export default StrayItem;