import {Body, Events, Vector, Composite} from 'matter-js';
import StrayItem from './StrayItem';

import {INTENT_BUILD} from '../data/intents/buildIntent';
import {INTENT_THROW} from "../data/intents/throwIntent";

const doPlanetGravity = (planet, otherBodies) => {
    otherBodies.forEach(body => {
        const force = planet.getGravityForce(body);
        Body.applyForce(body, body.position, force);
    });
};

class InteractionHandler {

    static itemDropCooldown = 45;
    static itemPickupDist   = 30;
    static itemDropForce    = 5;
    static itemThrowForce   = 12;

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

    beforeUpdate(engine) {
        this.updatePotentialPickup();
        const nonPlanetBodies = Composite.allBodies(engine.world).filter(body => body.label !== "planet");
        this.stage.planets.forEach(planet => {
            doPlanetGravity(planet, nonPlanetBodies);
        });
        this.stage.throwables.forEach(throwable => throwable.step(this));
    }

    takeItem() {
        const pickup = this.getNearbyStrayItem();
        if (!pickup) return;
        this.pickup(pickup);
        this.updatePotentialPickup();
    }

    getPlayerEmitVelocity(force) {
        return Vector.rotate({x: force, y: 0}, this.player.aimAngle);
    }

    dropItem() {
        const itemType = this.getActiveItemType();
        if (itemType && itemType.droppable) {
            const dropped  = this.playerState.removeFromInventory();
            const position = {...this.player.position};
            const cooldown = InteractionHandler.itemDropCooldown;
            const velocity = this.getPlayerEmitVelocity(InteractionHandler.itemDropForce);
            this.stage.addStrayItem(new StrayItem({itemType: dropped, ...position, velocity, cooldown}));
        }
    }

    getPlayerBuildPosition(offset = 35 + 16) {
        return Vector.add(this.player.position, Vector.rotate({x: offset, y: 0}, this.player.aimAngle));
    }

    getActiveItemType() {
        const slot = this.playerState.getActiveSlot();
        if (!slot.itemType || !slot.amount) return null;
        return slot.itemType;
    }

    getActiveItemIntentOf(type) {
        const itemType = this.getActiveItemType();
        if (!itemType) return null;
        return itemType.getIntentOf(type);
    }

    buildItem() {
        const buildIntent = this.getActiveItemIntentOf(INTENT_BUILD);
        if (!buildIntent) return;
        if (this.playerState.removeFromInventory(buildIntent.options.requires)) {
            const position = this.getPlayerBuildPosition();
            this.stage.addBuilding(buildIntent.options.buildable.toBuilding({
                angle: this.player.aimAngle,
                ...position,
            }));
        }
    }

    throwItem() {
        const throwIntent = this.getActiveItemIntentOf(INTENT_THROW);
        if (!throwIntent) return;
        if (this.playerState.removeFromInventory(1)) {
            const {make, drill = 0} = throwIntent.options.throwable;
            const position          = Vector.add({...this.player.position},
                Vector.rotate({x: drill, y: 0}, this.player.aimAngle));
            const velocity          = this.getPlayerEmitVelocity(InteractionHandler.itemThrowForce);
            this.stage.addThrowable(make({...position, velocity}));
        }
    }

    triggerPrimary() {
        const itemType = this.getActiveItemType();
        if (!itemType) return;
        const primaryIntent = itemType.getPrimaryIntent();
        if (!primaryIntent) return;
        if (primaryIntent.type === INTENT_BUILD) return this.buildItem();
        if (primaryIntent.type === INTENT_THROW) return this.throwItem();
        else if (primaryIntent.trigger) return primaryIntent.trigger(this);
    }

    triggerContinuous() {
        const itemType = this.getActiveItemType();
        if (!itemType) return;
        const primaryIntent = itemType.getPrimaryIntent();
        if (primaryIntent.continuous) this.triggerPrimary();
    }

    pickup(strayItem) {
        const added = this.playerState.addToInventory({itemType: strayItem.itemType});
        if (added) this.stage.removeStrayItem(strayItem);
    }

    attach(engine) {
        this._beforeUpdate = () => this.beforeUpdate(engine);
        Events.on(engine, 'beforeUpdate', this._beforeUpdate);
        return this;
    }

    detach(engine) {
        if (this._beforeUpdate) Events.off(engine, 'beforeUpdate', this._beforeUpdate);
        this._beforeUpdate = null;
    }
}

export default InteractionHandler;