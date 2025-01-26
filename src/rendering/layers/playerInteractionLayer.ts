import {Vertices, Vector} from 'matter-js';

import Layer from '../Layer';

import circle from '../../common/circle';

import {INTENT_BUILD} from '../../data/intents/buildIntent';
import {PLAYER_AIM_OFFSET} from '../../data/constants';

import Player from '../../Player';
import PlayerState from '../../logic/PlayerState';
import Stage from "../../logic/Stage";

interface ArrowVerticesOptions {
    offset?: number;
    length?: number;
    width?: number;
    angle: number;
    x: number;
    y: number;
}

interface BuildableVerticesOptions {
    buildable: any; // TODO: Define proper type when available
    offset?: number;
    size?: number;
    angle: number;
    x: number;
    y: number;
}

interface DrawVerticesOptions {
    context: CanvasRenderingContext2D;
    vertices: Vector[];
    fillStyle?: string | null;
    strokeStyle?: string | null;
    strokeWidth?: string;
}

export const arrowVertices = ({
    offset = 20,
    length = 10,
    width = 5,
    angle,
    x,
    y
}: ArrowVerticesOptions): Vector[] => {
    const vertices = [
        {x: offset, y: width},
        {x: offset, y: -width},
        {x: offset + length, y: 0},
    ];
    Vertices.rotate(vertices, angle, {x: 0, y: 0});
    Vertices.translate(vertices, {x, y}, 1);
    return vertices;
};

export const buildableVertices = ({
    buildable,
    offset = PLAYER_AIM_OFFSET,
    size = 32,
    angle,
    x,
    y
}: BuildableVerticesOptions): Vector[] => {
    const vertices = [
        {x: offset, y: size / 2},
        {x: offset, y: -size / 2},
        {x: offset + size, y: -size / 2},
        {x: offset + size, y: size / 2},
    ];
    Vertices.rotate(vertices, angle, {x: 0, y: 0});
    Vertices.translate(vertices, {x, y}, 1);
    return vertices;
};

export const drawVertices = ({
    context,
    vertices,
    fillStyle = null,
    strokeStyle = null,
    strokeWidth = '1px'
}: DrawVerticesOptions): void => {
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    vertices.forEach(p => context.lineTo(p.x, p.y));
    context.closePath();
    if (strokeStyle) {
        context.strokeStyle = strokeStyle;
        if (strokeWidth) context.lineWidth = Number(strokeWidth.replace('px', ''));
        context.stroke();
    }
    if (fillStyle) {
        context.fillStyle = fillStyle;
        context.fill();
    }
};

export const playerInteractionLayer = ({player, playerState, stage}: {
    player: Player;
    playerState: PlayerState;
    stage: Stage;
}): Layer => new Layer({
    render(context: CanvasRenderingContext2D) {
        const itemType = playerState.getActiveSlot().itemType;
        if (itemType?.renderPlayerInteractionPreview) {
            itemType.renderPlayerInteractionPreview(stage, context, player.position.x, player.position.y, player.aimAngle);
        } else if (itemType && itemType.getIntentByType(INTENT_BUILD)) {
            const buildable = itemType.getIntentByType<{
                buildable: any; // TODO: Define proper type when available
            }>(INTENT_BUILD)!.options.buildable;
            const vertices = buildableVertices({buildable, angle: player.aimAngle, ...player.position});
            drawVertices({context, vertices, strokeStyle: 'rgba(255,255,255,0.5)'});
        } else {
            const vertices = arrowVertices({angle: player.aimAngle, ...player.position});
            drawVertices({context, vertices, strokeStyle: 'rgba(255,255,255,0.5)'});
        }
        context.strokeStyle = 'rgba(255,255,255,.6)';
        context.lineWidth = 1;
        circle(context, player.position.x, player.position.y, 16, false, true);
    },
});