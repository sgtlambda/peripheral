import {Bodies} from 'matter-js';

import Building from './Building';

const defaultSize = 32;

export const makeDefaultCollider = ({
    x, y, angle, w = defaultSize, h = defaultSize,
    density = .01,
    // frictionAir = .3,
    sprite
}) => {
    return Bodies.rectangle(x, y, w, h, {
        density, frictionAir,
        angle,
        render: {
            fillStyle:   'transparent',
            strokeStyle: '#eee',
            lineWidth:   1,
        }
    });
};

export default class Buildable {

    constructor({
        name,
        strength = 100,
        density = 100,
        hitbox,
        sprite,
        makeCollider = null,
    }) {
        this.name         = name;
        this.strength     = strength;
        this.sprite       = sprite;
        this.makeCollider = makeCollider;
    }

    collider({x, y, angle}) {
        return this.makeCollider ? this.makeCollider({x, y, angle}, this) : makeDefaultCollider({x, y, angle});
    }

    toBuilding({x, y, angle}) {
        const body = this.collider({x, y, angle});
        return new Building({buildable: this, body});
    }
}