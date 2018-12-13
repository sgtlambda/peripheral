import {times, find} from 'lodash';

import inventoryKeyBinds from './../constants/inventoryKeyBinds';

class InventorySlot {
    constructor({itemType = null, amount = 0, keyBind = null} = {}) {
        this.itemType = itemType;
        this.amount   = amount;
        this.keyBind  = keyBind;
    }
}

const createInventory = (slots = 8) => {
    return times(slots, x => {
        return new InventorySlot({keyBind: inventoryKeyBinds[x]});
    });
};

class PlayerState {

    constructor({
        inventory = null,
        activeInventorySlot = 0,
        angle = 0,
    } = {}) {
        this.inventory           = inventory === null ? createInventory() : inventory;
        this.activeInventorySlot = activeInventorySlot;
    }

    firstEmptySlot() {
        return find(this.inventory, {itemType: null});
    }

    selectSlot(index) {
        this.activeInventorySlot = index;
    }

    getActiveSlot() {
        return this.inventory[this.activeInventorySlot];
    }

    removeFromActiveSlot(amount = 1) {
        const activeSlot = this.getActiveSlot();
        if (activeSlot.itemType === null || !activeSlot.amount) return false;
        else {
            const removedItemType = activeSlot.itemType;
            activeSlot.amount -= 1;
            if (activeSlot.amount === 0) activeSlot.itemType = null;
            return removedItemType;
        }
    }

    addToInventory({itemType, amount = 1}) {
        const slot = find(this.inventory, {itemType});
        if (slot) slot.amount += 1;
        else {
            const emptySlot = this.firstEmptySlot();
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