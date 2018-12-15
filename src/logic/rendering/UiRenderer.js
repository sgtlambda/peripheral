import {Events} from 'matter-js';

import renderItem from './renderItem';

import roundRect from './../../common/roundrect';

import renderTextWithShadow from './../../common/renderTextWithShadow';

const renderSlot = ({context, active = false, x, y, w, h}) => {
    context.strokeStyle = `rgba(255,255,255,${active ? '.8' : '.1'})`;
    context.fillStyle   = 'rgba(0,0,0,0.5)';
    roundRect(context, x, y, w, h, 2, true, true);
};

const renderInventorySlot = ({context, slot, active = false, x, y, w, h}) => {

    renderSlot({context, active, x, y, w, h});

    if (slot.itemType) {
        const item = {position: {x: x + w / 2, y: y + h / 2 - 5}, itemType: slot.itemType, amount: slot.amount};
        renderItem(context, item);
    }

    if (slot.keyBind) {
        context.font         = '10px monospace';
        context.fillStyle    = `rgba(255,255,255,${active ? '1' : '.5'})`;
        context.textAlign    = 'left';
        context.textBaseline = 'top';
        // context.fillText(slot.keyBind, x + 4, y + 2);
        renderTextWithShadow({context, text: slot.keyBind, x: x + 4, y: y + 2});
    }
};

function renderInventory({context, padding, size, inventory, activeSlot, x = 0, y = 0}) {
    inventory.forEach((slot, index) => {
        const active = index === activeSlot;
        renderInventorySlot({
            context, slot, active,
            x: padding + x * (size + padding),
            y: padding + y * (size + padding),
            w: size, h: size,
        });
        x++;
        if (x >= UiRenderer.inventoryColumns) {
            x = 0;
            y++;
        }
    })
}

const renderIntents = ({context, x, y, itemType}) => {
    if (itemType) {

        context.font         = '12px monospace';
        context.textAlign    = 'right';
        context.textBaseline = 'top';

        context.fillStyle = `white`;
        renderTextWithShadow({context, text: `drop ${itemType.name} [q]`, x, y});

        itemType.availableIntents.forEach(itemIntent => {
            y += 20;
            renderTextWithShadow({context, text: itemIntent.description, x, y});
        });
    }
};

class UiRenderer {

    static inventoryColumns = 1;

    static inventoryPadding = 4;

    static inventorySlotSize = 56;

    constructor(playerState) {
        this.playerState = playerState;
    }

    render(renderer) {

        const {context} = renderer;

        const padding = UiRenderer.inventoryPadding;
        const size    = UiRenderer.inventorySlotSize;

        context.save();

        renderInventory({
            context, padding, size,
            inventory:  this.playerState.inventory,
            activeSlot: this.playerState.activeInventorySlot,
        });

        renderIntents({
            context, x: renderer.options.width - 20, y: 20,
            itemType:   this.playerState.getActiveSlot().itemType,
        });

        context.restore();
    }

    attach(renderer) {
        this._callback = () => this.render(renderer);
        Events.on(renderer, 'afterRender', this._callback);
        return this;
    }

    detach(renderer) {
        if (this._callback) Events.off(renderer, 'afterRender', this._callback);
        this._callback = null;
        return this;
    }
}

export default UiRenderer;