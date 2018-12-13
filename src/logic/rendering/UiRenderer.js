import {Events} from 'matter-js';

import renderItem from './renderItem';

import roundRect from './../../common/roundrect';

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
        context.fillText(slot.keyBind, x + 4, y + 2);
    }
};

class UiRenderer {

    static inventoryColumns = 1;

    static inventoryPadding = 4;

    static inventorySlotSize = 56;

    constructor(playerState) {
        this.playerState = playerState;
    }

    render(context) {
        const padding = UiRenderer.inventoryPadding;
        const size    = UiRenderer.inventorySlotSize;

        let x = 0;
        let y = 0;

        context.save();

        this.playerState.inventory.forEach((slot, index) => {
            const active = index === this.playerState.activeInventorySlot;
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
        });
        context.restore();
    }

    attach(renderer) {
        this._callback = () => this.render(renderer.context);
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