import {World} from 'matter-js';

class Stage {

    constructor({
        strayItems = [],
        terrainBodies = [],
    } = {}) {
        this.strayItems    = strayItems;
        this.terrainBodies = terrainBodies;
    }

    /**
     * Add a stray (floating) item to this stage (builder phase)
     * @param {StrayItem} strayItem
     */
    addItem(strayItem) {
        this.strayItems.push(strayItem);
    }

    /**
     * Add a terrain body to this stage (builder phase)
     * @param {Body} terrainBody
     */
    addBody(terrainBody) {
        this.terrainBodies.push(terrainBody);
    }

    /**
     * Add all terrain bodies belonging to this stage
     * to the given physics world
     * @param world
     */
    provision(world) {
        World.add(world, this.terrainBodies);
        return this;
    }
}

export default Stage;