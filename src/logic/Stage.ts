import {Body, Composite, Vector, World} from 'matter-js';
import {without} from 'lodash';

import StageGraphics from './StageGraphics';
import {StepContext, StepEffect, System, WorldPart} from "../types";
import Planet from "./Planet";
import {NPC} from "../NPC";
import Throwable from "./Throwable";
import StrayItem from "./StrayItem";
import Building from "./Building";
import {CameraShakeStack} from "../CameraShakeStack";
import {ChiefTemporalOfficer} from "../ChiefTemporalOfficer";
import {SimClock} from "./SimClock";
import {Rng} from "../common/Rng";
import {GameEventBus} from "./GameEventBus";

class Stage implements WorldPart, System {

  public readonly graphics: StageGraphics;
  public readonly buildings: Building[];

  public planets: Planet[];

  public npcs: NPC[];

  public strayItems: StrayItem[];
  public stepEffects: StepEffect[];
  public throwables: Throwable[];
  public bodyQueue: Body[] = [];
  public cameraShakeStack: CameraShakeStack;
  public chiefTemporalOfficer: ChiefTemporalOfficer;

  /** The single source of time for gameplay code — see `SimClock`. */
  public readonly simClock: SimClock;

  /** The single source of randomness for anything that affects the simulation. */
  public readonly rng: Rng;

  /** Semantic game events — gameplay emits, presentation subscribes. */
  public readonly bus: GameEventBus;

  private provisioned: boolean = false;
  private _world!: World;

  /**
   * True while entities are being stepped; removals requested during this
   * window are deferred to the end of the step so that iteration stays safe.
   */
  private stepping: boolean = false;

  private pendingRemovals: Array<() => void> = [];

  constructor(
    public readonly initialPlayerPos: Vector,
    seed: number = 1,
  ) {
    this.graphics             = new StageGraphics();
    this.rng                  = new Rng(seed);
    this.bus                  = new GameEventBus();
    this.simClock             = new SimClock();
    this.cameraShakeStack     = new CameraShakeStack(this.rng.next);
    this.chiefTemporalOfficer = new ChiefTemporalOfficer();
    this.strayItems           = [];
    this.stepEffects          = [this.simClock, this.chiefTemporalOfficer, this.cameraShakeStack];
    this.throwables           = [];
    this.buildings            = [];
    this.planets              = [];
    this.bodyQueue            = [];
    this.npcs                 = [];
  }

  addBody(body: Body) {
    if (this._world) {
      // Add body post-provision phase
      Composite.add(this._world, body);
    } else {
      // Add body pre-provision phase
      this.bodyQueue.push(body);
    }
  }

  removeBody(body: Body) {
    if (this._world) {
      Composite.remove(this._world, body);
    } else {
      this.bodyQueue = without(this.bodyQueue, body);
    }
  }

  addNPC(npc: NPC) {
    this.npcs.push(npc);
  }

  addPlanet(planet: Planet) {
    this.planets.push(planet);
    this.addBody(planet.body);
    return planet;
  }

  /**
   * Add a stray (floating) item to this stage
   */
  addStrayItem(strayItem: StrayItem) {
    this.strayItems.push(strayItem);
    this.addBody(strayItem.getCollider());
  }

  /**
   * Add a throwable item to this stage
   */
  addThrowable(throwable: Throwable) {
    this.throwables.push(throwable);
    this.addBody(throwable.getCollider());
  }

  /**
   * Add a building to this stage
   */
  addBuilding(building: Building) {
    this.buildings.push(building);
    this.addBody(building.body);
  }

  removeStrayItem(strayItem: StrayItem) {
    if (this.deferWhileStepping(() => this.removeStrayItem(strayItem))) return;
    this.strayItems = without(this.strayItems, strayItem);
    this.removeBody(strayItem.getCollider());
  }

  removeThrowable(throwable: Throwable) {
    if (this.deferWhileStepping(() => this.removeThrowable(throwable))) return;
    this.throwables = without(this.throwables, throwable);
    this.removeBody(throwable.getCollider());
  }

  // Immediate (never deferred): `nom` relies on synchronous replacement of
  // planets, and the planets list is not iterated during `step`.
  removePlanet(planet: Planet) {
    this.planets = without(this.planets, planet);
    this.removeBody(planet.body);
  }

  /**
   * All bodies belonging to stage entities that an area effect (e.g. an
   * explosion) may push around. Deduplicated; static planets are excluded
   * since forces don't affect them.
   */
  getDynamicBodies(): Body[] {
    return Array.from(new Set([
      ...this.buildings.map(building => building.body),
      ...this.throwables.map(throwable => throwable.getCollider()),
      ...this.strayItems.map(strayItem => strayItem.getCollider()),
      ...this.npcs.map(npc => npc.body),
      ...this.planets.filter(planet => !planet.body.isStatic).map(planet => planet.body),
    ]));
  }

  /**
   * Step all stage entities and effects. Removals requested by an entity
   * during its own step (e.g. an expired throwable) are applied afterwards,
   * and finished effects are cleaned up.
   */
  step(ctx: StepContext) {
    this.stepping = true;
    try {
      for (const throwable of this.throwables) throwable.step(ctx);
      for (const strayItem of this.strayItems) strayItem.step(ctx);
      for (const stepEffect of this.stepEffects) stepEffect.step(ctx);
    } finally {
      this.stepping = false;
    }

    const removals        = this.pendingRemovals;
    this.pendingRemovals  = [];
    for (const removal of removals) removal();

    this.stepEffects = this.stepEffects.filter(effect => !effect.isFinished);
  }

  private deferWhileStepping(removal: () => void): boolean {
    if (!this.stepping) return false;
    this.pendingRemovals.push(removal);
    return true;
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

    this._world    = world;
    this.bodyQueue = [];
    return this;
  }
}

export default Stage;
