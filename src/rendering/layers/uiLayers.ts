import {Vector} from 'matter-js';

import {renderItem} from '../renderItem';

import roundRect from '../../common/roundrect';

import Layer from '../Layer';

import renderTextWithShadow from '../../common/renderTextWithShadow';

import {debugDrawGlobal} from '../../data/intents/debugDrawIntent';

import PlayerState, {InventorySlot} from '../../logic/PlayerState';
import ItemType from '../../logic/ItemType';
import Player from '../../Player';

const inventoryPadding  = 4;
const inventorySlotSize = 48;

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const renderSlot = ({context, active = false, x, y, w, h}: Box & {
  context: CanvasRenderingContext2D;
  active?: boolean;
}) => {
  context.strokeStyle = `rgba(255,255,255,${active ? '.8' : '.1'})`;
  context.fillStyle   = 'rgba(0,0,0,0.5)';
  roundRect(context, x, y, w, h, 2, true, true);
};

const renderInventorySlot = ({context, slot, active = false, x, y, w, h}: Box & {
  context: CanvasRenderingContext2D;
  slot: InventorySlot;
  active?: boolean;
}) => {

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
    renderTextWithShadow({context, text: slot.keyBind, x: x + 4, y: y + 2});
  }
};

function renderInventory({context, padding, size, inventory, activeSlot, x = 0, y = 0}: {
  context: CanvasRenderingContext2D;
  padding: number;
  size: number;
  inventory: InventorySlot[];
  activeSlot: number;
  x?: number;
  y?: number;
}) {
  inventory.forEach((slot, index) => {
    const active = index === activeSlot;
    renderInventorySlot({
      context, slot, active,
      x: padding + x * (size + padding),
      y: padding + y * (size + padding),
      w: size, h: size,
    });
    y++;
  });
}

const renderControls = ({playerState, context, x, y, itemType}: {
  playerState: PlayerState;
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  itemType?: ItemType;
}) => {

  context.font         = '12px monospace';
  context.textAlign    = 'right';
  context.textBaseline = 'top';
  context.fillStyle    = `white`;

  renderTextWithShadow({context, text: `move [w,a,s,d]`, x, y});

  y += 20;

  if (itemType) {

    if (itemType.droppable) {
      // TODO this should be reconciled with the `availableIntents` such that "drop"
      //  is just another available item intent here
      renderTextWithShadow({context, text: `drop ${itemType.name} [q]`, x, y});
      y += 20;
    }

    // TODO available intents should also be based on for example nearby NPCs

    itemType.availableIntents.forEach(itemIntent => {
      if (!itemIntent.description) return;
      renderTextWithShadow({context, text: itemIntent.description, x, y});
      y += 20;
    });
  }

  if (playerState.potentialPickup) {
    renderTextWithShadow({context, text: `take ${playerState.potentialPickup.itemType.name} [e]`, x, y});
    y += 20;
  }

  if (playerState.potentialInteractiveNpc) {
    renderTextWithShadow({context, text: `interact with ${playerState.potentialInteractiveNpc.name} [/]`, x, y});
    y += 20;
  }
};

const renderDebugText = ({context, player, gameMouse, x, y}: {
  context: CanvasRenderingContext2D;
  player: Player;
  gameMouse: Vector;
  x: number;
  y: number;
}) => {

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
};

const renderDebugPath = ({context, gameMouse}: {
  context: CanvasRenderingContext2D;
  gameMouse: Vector;
}) => {

  if (!debugDrawGlobal) return;
  const debugPath = debugDrawGlobal.path;
  if (debugPath.length) {
    context.lineWidth   = 1;
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

export default ({gameMouse, player, playerState}: {
  gameMouse: Vector;
  player: Player;
  playerState: PlayerState;
}): Layer[] => [
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

      const rightMargin = (renderer.options.width ?? 0) - 20;

      renderControls({
        context, x: rightMargin, y: 20,
        itemType:   playerState.getActiveSlot().itemType, playerState,
      });

      renderDebugText({
        context, x: rightMargin, y: (renderer.options.height ?? 0) - 80,
        player,
        gameMouse,
      });
    },
  }),
  new Layer({
    // hud: true,
    render(context) {
      renderDebugPath({context, gameMouse});
    },
  }),
];
