import renderItem from '../renderItem';

import roundRect from '../../../common/roundrect';

import Layer from '../Layer';

import renderTextWithShadow from '../../../common/renderTextWithShadow';

import {debugDrawGlobal} from '../../../data/intents/debugDrawIntent';

const inventoryPadding  = 4;
const inventorySlotSize = 48;

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
        y++;
    })
}

const renderControls = ({playerState, context, x, y, itemType}) => {

    context.font         = '12px monospace';
    context.textAlign    = 'right';
    context.textBaseline = 'top';
    context.fillStyle    = `white`;

    renderTextWithShadow({context, text: `move [w,a,s,d]`, x, y});
    y += 20;

    if (itemType) {

        if (itemType.droppable) {
            renderTextWithShadow({context, text: `drop ${itemType.name} [q]`, x, y});
            y += 20;
        }

        itemType.availableIntents.forEach(itemIntent => {
            renderTextWithShadow({context, text: itemIntent.description, x, y});
            y += 20;
        });
    }

    if (playerState.potentialPickup) {
        renderTextWithShadow({context, text: `take ${playerState.potentialPickup.itemType.name} [e]`, x, y});
        y += 20;
    }
};

const renderDebugText = ({context, player, gameMouse, x, y}) => {

    context.font         = '12px monospace';
    context.textAlign    = 'right';
    context.textBaseline = 'bottom';

    context.fillStyle = `white`;

    const ppos              = player.collider.position;
    const playerPosDebug    = `player x ${Math.round(ppos.x)} y ${Math.round(ppos.y)}`;
    const playerMotionDebug = `player motion ${Math.round(player.collider.speed * 10) / 10}`;
    const mouseDebug        = `igm x ${Math.round(gameMouse.x)} y ${Math.round(gameMouse.y)}`;

    const line = 16;

    renderTextWithShadow({context, text: mouseDebug, x, y});
    renderTextWithShadow({context, text: playerPosDebug, x, y: y + line});
    renderTextWithShadow({context, text: playerMotionDebug, x, y: y + line * 2});

    if (player.currentPlanet) {
        const planetInfo   = `planet [${player.currentPlanet.name}]`;
        const altitudeInfo = `altitude [${Math.round(player.currentPlanet.getPointAltitude(player.position))}]`;
        renderTextWithShadow({context, text: planetInfo, x, y: y + line * 3});
        renderTextWithShadow({context, text: altitudeInfo, x, y: y + line * 4});
    }
};

const renderDebugPath = ({context, gameMouse}) => {

    if (!debugDrawGlobal) return;
    const debugPath = debugDrawGlobal.path;
    if (debugPath.length) {
        context.strokeWidth = '1px';
        context.strokeStyle = 'white';
        context.fillStyle   = 'white';
        context.beginPath();
        context.moveTo(debugPath[0].x, debugPath[0].y);
        debugPath.forEach(p => {
            context.fillRect(p.x - 2, p.y - 2, 4, 4);
            context.lineTo(p.x, p.y);
        });
        context.lineTo(gameMouse.x, gameMouse.y);
        context.stroke();
    }
};

export default ({gameMouse, player, playerState}) => [
    new Layer({
        hud: true,
        render(context, renderer) {

            renderInventory({
                context,
                padding:    inventoryPadding,
                size:       inventorySlotSize,
                inventory:  playerState.inventory,
                activeSlot: playerState.activeInventorySlot,
            });

            const rightMargin = renderer.options.width - 20;

            renderControls({
                context, x: rightMargin, y: 20,
                itemType:   playerState.getActiveSlot().itemType, playerState,
            });

            renderDebugText({
                context, x: rightMargin, y: renderer.options.height - 80,
                player:     player, playerState: playerState,
                gameMouse:  gameMouse,
            });
        }
    }),
    new Layer({
        // hud: true,
        render(context) {
            renderDebugPath({context, gameMouse: gameMouse});
        }
    })
];