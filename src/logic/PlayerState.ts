import {find, times} from 'lodash';

import {keyBinds, slots as defaultInventorySize} from '../data/inventory';
import {NPC} from "../NPC";
import StrayItem from "./StrayItem";
import ItemType from "./ItemType";

class InventorySlot {

  itemType?: ItemType;
  amount?: number;
  keyBind?: string;

  constructor({itemType, amount = 0, keyBind}: {
    itemType?: ItemType;
    amount?: number;
    keyBind?: string;
  }) {
    this.itemType = itemType;
    this.amount   = amount;
    this.keyBind  = keyBind;
  }
}

const createInventory = (slots = defaultInventorySize) => {
  return times(slots, x => {
    return new InventorySlot({keyBind: keyBinds[x]});
  });
};

class PlayerState {

  inventory: InventorySlot[];

  potentialPickup: StrayItem | null   = null;
  potentialInteractiveNpc: NPC | null = null;

  activeInventorySlot!: number;

  constructor(
    {
      inventory = null,
      activeInventorySlot = 0,
    }: {
      inventory?: InventorySlot[] | null;
      activeInventorySlot?: number;
    } = {}
  ) {
    this.inventory = inventory === null ? createInventory() : inventory;
    this.selectSlot(activeInventorySlot);
  }

  firstEmptySlot() {
    return find(this.inventory, slot => !slot.itemType);
  }

  selectSlot(index: number) {
    this.activeInventorySlot = index;
  }

  getActiveSlot(): InventorySlot {
    return this.inventory[this.activeInventorySlot];
  }

  /**
   * Remove the given amount from the active inventory slot.
   */
  removeFromInventory(amount = 1): ItemType | undefined {
    const targetSlot = this.getActiveSlot();
    if (targetSlot.itemType === null || (targetSlot.amount ?? 0) < amount) return undefined;
    else {
      const removedItemType = targetSlot.itemType;
      targetSlot.amount! -= amount;
      if (targetSlot.amount === 0) targetSlot.itemType = undefined;
      return removedItemType;
    }
  }

  addToInventory({itemType, amount = 1, slot: overrideSlot}: {
    itemType: ItemType;
    amount?: number;
    slot?: number;
  }) {
    const slot = find(this.inventory, {itemType});
    if (slot) slot.amount! += amount;
    else {
      const emptySlot = overrideSlot ? this.inventory[overrideSlot] : this.firstEmptySlot();
      if (!emptySlot) return false;
      else {
        emptySlot.itemType = itemType;
        emptySlot.amount   = amount;
      }
    }
    return true;
  }
}

export default PlayerState;