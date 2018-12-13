import {Vector} from 'matter-js';

class StrayItem {

    static floatiness = .9;
    static maxStop    = .1;

    constructor({itemType, position, speed = null, cooldown = 0}) {
        this.itemType = itemType;
        this.position = position;
        this.speed    = speed;
        this.cooldown = cooldown;
    }

    step() {
        if (this.cooldown > 0) this.cooldown -= 1;
        if (this.speed) {
            this.position = Vector.add(this.position, this.speed);
            this.speed    = Vector.mult(this.speed, StrayItem.floatiness);
            if (Vector.magnitude(this.speed) < StrayItem.maxStop) {
                this.speed = null;
            }
        }
    }
}

export default StrayItem;