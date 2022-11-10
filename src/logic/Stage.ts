import assert from 'assert';

import {Body, Composite, Vector, World} from 'matter-js';
import {without} from 'lodash';

import StageGraphics from './StageGraphics';
import {Building, StrayItem, Throwable} from "../todoTypes";
import {WorldPart} from "../types";
import Planet from "./Planet";

class Stage implements WorldPart {

  public readonly graphics: StageGraphics;
  public readonly terrainBodies: Body[];
  public readonly buildings: Building[];

  public planets: Planet[];

  public strayItems: StrayItem[];
  public throwables: Throwable[];
  public bodyQueue: Body[];
  public addedBodies: Body[];

  private provisioned: boolean;
  private _world: World;

  constructor(
    public readonly initialPlayerPos: Vector,
  ) {
    this.graphics      = new StageGraphics();
    this.strayItems    = [];
    this.throwables    = [];
    this.terrainBodies = [];
    this.buildings     = [];
    this.planets       = [];
    this.bodyQueue     = [];

    this.addedBodies = [];
  }

  addBody(body: Body) {
    // TODO figure out how to get rid of this workaround
    if (this._world) {
      // Add body post-provision phase
      Composite.add(this._world, body);
      this.addedBodies.push(body);
    } else {
      // Add body pre-provision phase
      this.bodyQueue.push(body);
    }
  }

  removeBody(body) {
    if (this._world) {
      Composite.remove(this._world, body);
      this.addedBodies = without(this.addedBodies, body);
    } else {
      this.bodyQueue = without(this.bodyQueue, body);
    }
  }

  /**
   * Please note: don't call "addTerrainBody" for the planet body,
   * that is already taken care of internally
   * @param {Planet} planet
   */
  addPlanet(planet) {
    this.planets.push(planet);
    this.addTerrainBody(planet.body);
    return planet;
  }

  /**
   * Add a stray (floating) item to this stage
   * @param {StrayItem} strayItem
   */
  addStrayItem(strayItem) {
    this.strayItems.push(strayItem);
    this.addBody(strayItem.collider);
  }

  /**
   * Add a throwable item to this stage
   * @param {Throwable} throwable
   */
  addThrowable(throwable) {
    this.throwables.push(throwable);
    this.addBody(throwable.collider);
  }

  /**
   * Add a terrain body to this stage
   */
  addTerrainBody(terrainBody: Body) {
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

  removeThrowable(throwable) {
    this.throwables = without(this.throwables, throwable);
    this.removeBody(throwable.collider);
  }

  removePlanet(planet) {
    this.planets = without(this.planets, planet);
    this.removeBody(planet.body);
  }

  /**
   * Add all terrain bodies belonging to this stage to the given physics world
   * and "link up" the world with this Stage so that bodies can be added at runtime
   */
  provision(world) {
    assert(!this.provisioned, 'Cannot provision Stage twice.');
    this.provisioned = true;
    for (const body of this.bodyQueue) {
      Composite.add(world, body);
    }
    this._world      = world;
    this.addedBodies = this.bodyQueue;
    this.bodyQueue   = null;
    return this;
  }
}

export default Stage;