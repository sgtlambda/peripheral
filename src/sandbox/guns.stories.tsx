import React, {useEffect, useRef} from "react";
import {ItemSprite} from "../logic/ItemType";
import {createGunSprite} from "../rendering/items/gunSprite";
import {drawHeldSprite, drawLooseSprite, heldSpritePoint} from "../rendering/layers/itemSpritesLayer";
import {HalftoneSurface} from "../rendering/halftone/HalftoneSurface";
import {orbField} from "../rendering/halftone/field";

const WIDTH  = 300;
const HEIGHT = 250;
const RADIUS = 16;
const ZOOM   = 3.5;
const PLAYER_INK = "rgb(255,86,160)";

/** A halftone player orb holding `sprite`, drawn at (x, y) in the current space, with its shot line. */
function drawHolder(ctx: CanvasRenderingContext2D, x: number, y: number, aimAngle: number, sprite: ItemSprite) {
  const surface = new HalftoneSurface();
  surface.draw(ctx, [{
    key: {}, x, y, reach: RADIUS * 1.2, color: PLAYER_INK,
    field: orbField({x, y, radius: RADIUS, maxDot: surface.maxDot, look: aimAngle}),
  }], 0);
  const holder = {x, y, radius: RADIUS, aimAngle};
  drawHeldSprite(ctx, holder, sprite);
  if (sprite.muzzle) {
    // Where the gun's ray starts and runs, as in `gun.ts`.
    const start = heldSpritePoint(holder, sprite.muzzle);
    ctx.save();
    ctx.strokeStyle = "rgba(255,119,88,0.9)";
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(start.x + Math.cos(aimAngle) * 40, start.y + Math.sin(aimAngle) * 40);
    ctx.stroke();
    ctx.restore();
  }
}

/** A gun: held aiming right and left (zoomed), plus a 1× strip with a held and a dropped gun. */
function GunPanel({name, sprite}: {name: string; sprite: ItemSprite}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "rgb(17,17,17)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Zoomed: aiming right-and-up, and left-and-down.
    ctx.save();
    ctx.scale(ZOOM, ZOOM);
    drawHolder(ctx, 22, 26, -0.3, sprite);
    drawHolder(ctx, 64, 30, Math.PI - 0.3, sprite);
    ctx.restore();

    // 1× strip on white terrain: held, and lying dropped.
    const groundY = HEIGHT - 24;
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, groundY, WIDTH, HEIGHT - groundY);
    drawHolder(ctx, 70, groundY - RADIUS - 2, -0.2, sprite);
    drawLooseSprite(ctx, 180, groundY - 9, sprite);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font      = "10px monospace";
    ctx.fillText("1×", 12, groundY - 30);
  }, [sprite]);

  return <div style={{width: WIDTH}}>
    <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{display: "block", border: "1px solid #333"}}/>
    <div style={{fontFamily: "sans-serif", fontSize: 13, fontWeight: 600, marginTop: 4}}>{name}</div>
  </div>;
}

/** The gun, held by the halftone player and lying on the ground. */
export const Guns = () => <GunPanel name="gun" sprite={createGunSprite()}/>;
