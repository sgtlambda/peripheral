import assert from 'assert';

import {World} from 'matter-js';

import {without} from 'lodash';

class Stage {

    constructor({
        strayItems = [],
        terrainBodies = [],
        buildings = [],
    } = {}) {
        this.strayItems    = strayItems;
        this.terrainBodies = terrainBodies;
        this.buildings     = buildings;
    }

    /**
     * Add a stray (floating) item to this stage (builder phase)
     * @param {StrayItem} strayItem
     */
    addItem(strayItem) {
        this.strayItems.push(strayItem);
    }

    removeItem(strayItem) {
        this.strayItems = without(this.strayItems, strayItem);
    }

    /**
     * Add a terrain body to this stage (builder phase)
     * @param {Body} terrainBody
     */
    addBody(terrainBody) {
        this.terrainBodies.push(terrainBody);
    }

    addBuilding(building) {
        this.buildings.push(building);
        World.add(this._world, [building.body])
    }

    /**
     * Add all terrain bodies belonging to this stage
     * to the given physics world
     * @param world
     */
    provision(world) {
        assert(!this.provisioned, 'Cannot provision Stage twice.');
        this.provisioned = true;
        World.add(world, this.terrainBodies);
        this._world = world;
        return this;
    }
}

export default Stage;