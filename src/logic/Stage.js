import assert from 'assert';
import {Composite} from 'matter-js';
import {without, minBy} from 'lodash';

import StageGraphics from './StageGraphics';

class Stage {

    constructor({
        strayItems = [],
        terrainBodies = [],
        buildings = [],
        graphics = null,
        initialPlayerPos = {x: 0, y: 0},
    } = {}) {
        this.strayItems       = strayItems;
        this.terrainBodies    = terrainBodies;
        this.buildings        = buildings;
        this.graphics         = graphics === null ? new StageGraphics() : graphics;
        this.initialPlayerPos = initialPlayerPos;
        this.planets          = [];
        this.bodyQueue        = [];
    }

    addBody(body) {
        if (this._world) {
            // Add body post-provision phase
            Composite.add(this._world, [body]);
        } else {
            // Add body pre-provision phase
            this.bodyQueue.push(body);
        }
    }

    removeBody(body) {
        if (this._world) {
            Composite.remove(this._world, [body]);
        } else {
            this.bodyQueue = without(this.bodyQueue, body);
        }
    }

    getClosestPlanet(point) {
        return minBy(this.planets, planet => {
            return planet.getPointAltitude(point);
        });
    }

    /**
     * Please note: don't call "addTerrainBody" for the planet body,
     * that is already taken care of internally
     * @param {Planet} planet
     */
    addPlanet(planet) {
        this.planets.push(planet);
        this.addTerrainBody(planet.body);
    }

    /**
     * Add a stray (floating) item to this stage (builder phase)
     * @param {StrayItem} strayItem
     */
    addStrayItem(strayItem) {
        this.strayItems.push(strayItem);
        this.addBody(strayItem.collider);
    }

    /**
     * Add a terrain body to this stage
     * @param {Body} terrainBody
     */
    addTerrainBody(terrainBody) {
        this.terrainBodies.push(terrainBody);
        this.addBody(terrainBody);
    }

    /**
     * Add a building to this stage
     * @param building
     */
    addBuilding(building) {
        this.buildings.push(building);
        this.addBody(building.body);
    }

    removeStrayItem(strayItem) {
        this.strayItems = without(this.strayItems, strayItem);
        this.removeBody(strayItem.collider);
    }

    /**
     * Add all terrain bodies belonging to this stage to the given physics world
     * and "link up" the world with this Stage so that bodies can be added at runtime
     * @param world
     */
    provision(world) {
        assert(!this.provisioned, 'Cannot provision Stage twice.');
        this.provisioned = true;
        Composite.add(world, this.bodyQueue);
        this._world = world;
        return this;
    }
}

export default Stage;