import {Body, Composite, Vector, World} from 'matter-js';
import {without} from 'lodash';

import StageGraphics from './StageGraphics';
import {HasStep, WorldPart} from "../types";
import Planet from "./Planet";
import {NPC} from "../NPC";
import Throwable from "./Throwable";
import StrayItem from "./StrayItem";
import Building from "./Building";
import {CameraShakeStack} from "../CameraShakeStack";
import {ChiefTemporalOfficer} from "../ChiefTemporalOfficer";

class Stage implements WorldPart {

  public readonly graphics: StageGraphics;
  public readonly terrainBodies: Body[];
  public readonly buildings: Building[];

  public planets: Planet[];

  public npcs: NPC[];

  public strayItems: StrayItem[];
  public stepEffects: HasStep[];
  public throwables: Throwable[];
  public bodyQueue: Body[] = [];
  public addedBodies: Body[];
  public cameraShakeStack: CameraShakeStack;
  public chiefTemporalOfficer: ChiefTemporalOfficer;

  private provisioned: boolean = false;
  private _world!: World;

  constructor(
    public readonly initialPlayerPos: Vector,
  ) {
    this.graphics             = new StageGraphics();
    this.cameraShakeStack     = new CameraShakeStack();
    this.chiefTemporalOfficer = new ChiefTemporalOfficer();
    this.strayItems           = [];
    this.stepEffects          = [this.cameraShakeStack];
    this.throwables           = [];
    this.terrainBodies        = [];
    this.buildings            = [];
    this.planets              = [];
    this.bodyQueue            = [];
    this.npcs                 = [];

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

  removeBody(body: Body) {
    if (this._world) {
      Composite.remove(this._world, body);
      this.addedBodies = without(this.addedBodies, body);
    } else {
      this.bodyQueue = without(this.bodyQueue, body);
    }
  }

  addNPC(npc: NPC) {
    this.npcs.push(npc);
  }

  addPlanet(planet: Planet) {
    this.planets.push(planet);
    this.addTerrainBody(planet.body);
    return planet;
  }

  /**
   * Add a stray (floating) item to this stage
   * @param {StrayItem} strayItem
   */
  addStrayItem(strayItem: StrayItem) {
    this.strayItems.push(strayItem);
    this.addBody(strayItem.getCollider());
  }

  /**
   * Add a throwable item to this stage
   * @param {Throwable} throwable
   */
  addThrowable(throwable: Throwable) {
    this.throwables.push(throwable);
    this.addBody(throwable.getCollider());
  }

  /**
   * Add a terrain body to this stage
   */
  private addTerrainBody(terrainBody: Body) {
    this.terrainBodies.push(terrainBody);
    this.addBody(terrainBody);
  }

  /**
   * Add a building to this stage
   * @param building
   */
  addBuilding(building: Building) {
    this.buildings.push(building);
    this.addBody(building.body);
  }

  removeStrayItem(strayItem: StrayItem) {
    this.strayItems = without(this.strayItems, strayItem);
    this.removeBody(strayItem.getCollider());
  }

  removeThrowable(throwable: Throwable) {
    this.throwables = without(this.throwables, throwable);
    this.removeBody(throwable.getCollider());
  }

  removePlanet(planet: Planet) {
    this.planets = without(this.planets, planet);
    this.removeBody(planet.body);
  }

  /**
   * Add all terrain bodies belonging to this stage to the given physics world
   * and "link up" the world with this Stage so that bodies can be added at runtime
   */
  provision(world: World) {

    if (this.provisioned) {
      throw new Error('Cannot provision Stage twice.');
    }

    this.provisioned = true;

    for (const body of this.bodyQueue) Composite.add(world, body);

    for (const character of this.npcs) character.provision(world);

    this._world      = world;
    this.addedBodies = this.bodyQueue;
    this.bodyQueue   = [];
    return this;
  }
}

export default Stage;