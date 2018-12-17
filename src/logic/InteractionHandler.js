import {Events, Vector} from 'matter-js';
import StrayItem from './StrayItem';

class InteractionHandler {

    static itemDropCooldown = 45;

    static itemPickupDist = 30;

    static itemDropForce = 5;

    constructor({
        stage,
        player,
        playerState,
        gameMouse,
    }) {
        this.stage       = stage;
        this.player      = player;
        this.playerState = playerState;
        this.gameMouse   = gameMouse;
    }

    getNearbyStrayItem() {
        const ppos  = this.player.position;
        let result  = null;
        let minDist = -1;
        this.stage.strayItems.forEach(strayItem => {
            strayItem.step();
            if (strayItem.cooldown > 1) return;
            const ipos = strayItem.position;
            const dist = Vector.magnitude({x: Math.abs(ipos.x - ppos.x), y: Math.abs(ipos.y - ppos.y)});
            if (dist < InteractionHandler.itemPickupDist) {
                if (dist < minDist || minDist === -1) {
                    result  = strayItem;
                    minDist = dist;
                }
            }
        });
        return result;
    }

    updatePotentialPickup() {
        this.playerState.potentialPickup = this.getNearbyStrayItem();
    }

    step() {
        this.updatePotentialPickup();
    }

    takeItem() {
        const pickup = this.getNearbyStrayItem();
        if (!pickup) return;
        this.pickup(pickup);
        this.updatePotentialPickup();
    }

    dropItem() {
        const itemType = this.playerState.getActiveItemType();
        if (itemType && itemType.droppable) {
            const dropped  = this.playerState.removeFromInventory();
            const position = {x: this.player.position.x, y: this.player.position.y};
            const cooldown = InteractionHandler.itemDropCooldown;
            const velocity = Vector.rotate({x: InteractionHandler.itemDropForce, y: 0}, this.player.angle);
            this.stage.addStrayItem(new StrayItem({itemType: dropped, ...position, velocity, cooldown}));
        }
    }

    getPlayerBuildPosition(offset = 35 + 16) {
        return Vector.add(this.player.position, Vector.rotate({x: offset, y: 0}, this.player.angle));
    }

    buildItem() {
        const itemType = this.playerState.getActiveItemType();
        if (!itemType) return;
        const buildIntent = itemType.getBuildIntent();
        if (buildIntent) {
            if (this.playerState.removeFromInventory(buildIntent.options.requires)) {
                const position = this.getPlayerBuildPosition();
                this.stage.addBuilding(buildIntent.options.buildable.toBuilding({
                    angle: this.player.angle,
                    ...position,
                }));
            }
        }
    }

    triggerPrimary() {
        const itemType = this.playerState.getActiveItemType();
        if (!itemType) return;
        const primaryIntent = itemType.getPrimaryIntent();
        if (!primaryIntent) return;
        if (primaryIntent.name === 'build') return this.buildItem();
        else if (primaryIntent.trigger) return primaryIntent.trigger(this);
    }

    pickup(strayItem) {
        const added = this.playerState.addToInventory({itemType: strayItem.itemType});
        if (added) this.stage.removeStrayItem(strayItem);
    }

    attach(engine) {
        this._callback = () => this.step();
        Events.on(engine, 'afterUpdate', this._callback);
        return this;
    }

    detach(engine) {
        if (this._callback) Events.off(engine, 'afterUpdate', this._callback);
        this._callback = null;
    }
}

export default InteractionHandler;