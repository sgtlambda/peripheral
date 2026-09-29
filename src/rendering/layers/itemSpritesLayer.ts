import Layer from '../Layer';

import Character from '../../Character';
import Stage from '../../logic/Stage';
import {ItemSprite} from '../../logic/ItemType';

/**
 * Where the hand is, in the holder's aim frame (x along the aim, y "down" —
 * mirrored when aiming left), as a ratio of the collider radius: forward and
 * a little low, so a held gun sits below the eye line instead of over the eye.
 */
const GRIP = {x: 0.3, y: 0.4};

/** Whoever holds an item: where they are, how big, and where they aim. */
export type Holder = {x: number; y: number; radius: number; aimAngle: number};

export const holderOf = (character: Character): Holder => ({
  ...character.position,
  radius:   character.collider.circleRadius ?? 16,
  aimAngle: character.aimAngle,
});

/** The transform from item space to the world for an item held by `holder`. */
const heldItemTransform = ({x, y, radius, aimAngle}: Holder) => {
  const facingLeft = Math.cos(aimAngle) < 0;
  return new DOMMatrix()
    .translate(x, y)
    .rotate(aimAngle * 180 / Math.PI)
    .scale(1, facingLeft ? -1 : 1)
    .translate(radius * GRIP.x, radius * GRIP.y);
};

/** Where a point in a held item's space (e.g. its muzzle) lands in the world. */
export const heldSpritePoint = (holder: Holder, point: {x: number; y: number}) => {
  const {x, y} = heldItemTransform(holder).transformPoint(point);
  return {x, y};
};

/** Draw an item in the hand of a holder, pointing along its aim. */
export const drawHeldSprite = (context: CanvasRenderingContext2D, holder: Holder, sprite: ItemSprite) => {
  const {a, b, c, d, e, f} = heldItemTransform(holder);
  context.save();
  context.transform(a, b, c, d, e, f);
  sprite.draw(context);
  context.restore();
};

/** Draw a loose item lying in the world, centred on its body. */
export const drawLooseSprite = (context: CanvasRenderingContext2D, x: number, y: number, sprite: ItemSprite) => {
  context.save();
  context.translate(x - sprite.center.x, y - sprite.center.y);
  sprite.draw(context);
  context.restore();
};

/**
 * Items with sprites (guns, …) drawn as themselves rather than on the halftone
 * surface: in the hands of the player and NPCs, and lying loose in the world.
 * Sits above the halftone layer so a held item reads over its holder.
 */
export const itemSpritesLayer = ({characters, stage}: {
  /** Characters whose held items to draw, besides the stage's NPCs */
  characters: Character[];
  stage: Stage;
}): Layer => new Layer({
  render(context) {
    stage.strayItems.forEach(item => {
      const sprite = item.itemType.sprite;
      if (sprite) drawLooseSprite(context, item.position.x, item.position.y, sprite);
    });
    [...characters, ...stage.npcs].forEach(character => {
      const sprite = character.heldItem?.sprite;
      if (sprite) drawHeldSprite(context, holderOf(character), sprite);
    });
  },
});
