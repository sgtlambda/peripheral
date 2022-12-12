import {times, find} from 'lodash';

import {keyBinds, slots as defaultInventorySize} from '../data/inventory';
import {StrayItem} from "../todoTypes";

class InventorySlot {

    itemType: any; // TODO
    amount: number;
    keyBind: any; // TODO;

    constructor({itemType = null, amount = 0, keyBind = null} = {}) {
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

    potentialPickup: StrayItem | null;

    activeInventorySlot: number;

    constructor({
        inventory = null,
        activeInventorySlot = 0,
    } = {}) {
        this.inventory = inventory === null ? createInventory() : inventory;
        this.selectSlot(activeInventorySlot);
        this.potentialPickup = null;
    }

    firstEmptySlot() {
        return find(this.inventory, {itemType: null});
    }

    selectSlot(index) {
        this.activeInventorySlot = index;
    }

    /**
     * @returns {InventorySlot}
     */
    getActiveSlot() {
        return this.inventory[this.activeInventorySlot];
    }

    /**
     * Remove the given amount from the inventory slot at the given index (defaults to active slot)
     * @param amount
     * @param slot
     * @returns {*}
     */
    removeFromInventory(amount = 1, slot = null) {
        const activeSlot = slot === null ? this.getActiveSlot() : slot;
        if (activeSlot.itemType === null || activeSlot.amount < amount) return false;
        else {
            const removedItemType = activeSlot.itemType;
            activeSlot.amount -= amount;
            if (activeSlot.amount === 0) activeSlot.itemType = null;
            return removedItemType;
        }
    }

    addToInventory({itemType, amount = 1, slot: overrideSlot = null}) {
        const slot = find(this.inventory, {itemType});
        if (slot) slot.amount += amount;
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