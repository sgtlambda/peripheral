import {Events, Vector} from 'matter-js';
import StrayItem from './StrayItem';

class InteractionHandler {

    static itemDropCooldown = 45;

    constructor({
        stage,
        player,
        playerState,
        pickupDist = 50,
    }) {
        this.stage       = stage;
        this.player      = player;
        this.playerState = playerState;

        this.pickupDist = pickupDist;
    }

    step() {
        const ppos = this.player.position;
        this.stage.strayItems.forEach(strayItem => {
            strayItem.step();
            if (strayItem.cooldown > 1) return;
            const ipos = strayItem.position;
            const dist = Vector.magnitude({x: Math.abs(ipos.x - ppos.x), y: Math.abs(ipos.y - ppos.y)});
            if (dist < this.pickupDist) this.pickup(strayItem);
        });
    }

    dropItem() {
        const itemType = this.playerState.removeFromInventory();
        if (itemType) {
            const position = {x: this.player.position.x, y: this.player.position.y};
            const cooldown = InteractionHandler.itemDropCooldown;
            const speed    = Vector.rotate({x: 10, y: 0}, this.player.angle);
            this.stage.addItem(new StrayItem({itemType, position, speed, cooldown}));
        }
    }

    getPlayerBuildPosition(offset = 35 + 16) {
        return Vector.add(this.player.position, Vector.rotate({x: offset, y: 0}, this.player.angle));
    }

    buildItem() {
        const slot     = this.playerState.getActiveSlot();
        const itemType = slot.itemType;
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

    pickup(strayItem) {
        const added = this.playerState.addToInventory({itemType: strayItem.itemType});
        if (added) this.stage.removeItem(strayItem);
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