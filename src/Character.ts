import {Bodies, Body, Vector, World} from 'matter-js';

import {cPlayer, cTerrain} from './data/collisionGroups';
import {ITEM_DROP_COOLDOWN_MS, ITEM_DROP_FORCE} from './data/constants';

import debugRender from './data/debugRender';

import Stage from "./logic/Stage";
import ItemType from "./logic/ItemType";
import StrayItem from "./logic/StrayItem";

import {WorldPart} from "./types";

export type CharacterConstructorProps = {
  x: number,
  y: number,
  stage: Stage,
  radius?: number,
  friction?: number,
};

class Character implements WorldPart {

  public readonly stage: Stage;

  public collider!: Body;

  public readonly friction: number;

  /** Where the character aims (radians, 0 = +x); held items point this way */
  public aimAngle: number = 0;

  /** The item in the character's hands, if any — drawn over it and aimed along `aimAngle` */
  public heldItem: ItemType | null = null;

  constructor(
    {
      x, y,
      stage,
      radius = 16,
      friction = .5,
    }: CharacterConstructorProps) {

    this.stage    = stage;
    this.friction = friction;
    this.prepareBodies({x, y, radius});
  }

  get body() {
    return this.collider;
  }

  prepareBodies({x, y, radius}: { x: number, y: number, radius: number }) {
    this.collider = Bodies.circle(x, y, radius, {
      friction:        this.friction,
      inertia:         Infinity,
      render:          debugRender,
      collisionFilter: {
        category: cPlayer,
        mask:     cTerrain,
      },
    });
    // Characters are drawn on the halftone surface (see `halftoneLayer`).
    this.collider.render.visible = false;
  }

  get position() {
    return this.collider.position;
  }

  getAimVector(size: number) {
    return Vector.rotate({x: size, y: 0}, this.aimAngle);
  }

  getAimPosition(offset: number) {
    return Vector.add(this.position, this.getAimVector(offset));
  }

  /** Put an item in the character's hands. Returns whatever it was holding before. */
  equip(itemType: ItemType): ItemType | null {
    const previous = this.heldItem;
    this.heldItem  = itemType;
    return previous;
  }

  /** Empty the character's hands. Returns the item it was holding, if any. */
  unequip(): ItemType | null {
    const previous = this.heldItem;
    this.heldItem  = null;
    return previous;
  }

  /**
   * Toss the held item into the world, along the aim, as a stray item anyone
   * can pick up once its cooldown has passed. Returns it, if there was one.
   */
  dropHeldItem(): StrayItem | null {
    const itemType = this.unequip();
    if (!itemType) return null;
    const dropped = new StrayItem({
      itemType,
      ...this.position,
      velocity: this.getAimVector(ITEM_DROP_FORCE),
      cooldown: ITEM_DROP_COOLDOWN_MS,
    });
    this.stage.addStrayItem(dropped);
    return dropped;
  }

  /**
   * Take a stray item from the world into the character's hands, dropping
   * whatever it held before. Returns false if the item isn't ready yet.
   */
  pickUp(strayItem: StrayItem): boolean {
    if (!strayItem.isReady()) return false;
    this.dropHeldItem();
    this.stage.removeStrayItem(strayItem);
    this.equip(strayItem.itemType);
    return true;
  }

  provision(world: World) {
    World.add(world, [this.collider]);
    return this;
  }
}

export default Character;
