import {Vertices} from 'matter-js';

import Layer from '../Layer.ts';

import circle from '../../common/circle';

import {INTENT_BUILD} from '../../data/intents/buildIntent';
import {PLAYER_AIM_OFFSET} from '../../data/constants';

export const arrowVertices = ({offset = 20, length = 10, width = 5, angle, x, y}) => {
    const vertices = [
        {x: offset, y: width},
        {x: offset, y: -width},
        {x: offset + length, y: 0},
    ];
    Vertices.rotate(vertices, angle, {x: 0, y: 0});
    Vertices.translate(vertices, {x, y});
    return vertices;
};

export const buildableVertices = ({buildable, offset = PLAYER_AIM_OFFSET, size = 32, angle, x, y}) => {
    const vertices = [
        {x: offset, y: size / 2},
        {x: offset, y: -size / 2},
        {x: offset + size, y: -size / 2},
        {x: offset + size, y: size / 2},
    ];
    Vertices.rotate(vertices, angle, {x: 0, y: 0});
    Vertices.translate(vertices, {x, y});
    return vertices;
};

export const drawVertices = ({context, vertices, fillStyle = null, strokeStyle = null, strokeWidth = '1px'}) => {
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    vertices.forEach(p => context.lineTo(p.x, p.y));
    context.closePath();
    if (strokeStyle) {
        context.strokeStyle = strokeStyle;
        if (strokeWidth) context.strokeWidth = strokeWidth;
        context.stroke();
    }
    if (fillStyle) {
        context.fillStyle = fillStyle;
        context.fill();
    }
};

export default ({player, playerState}) => new Layer({
    render(context) {
        const itemType = playerState.getActiveSlot().itemType;
        if (itemType && itemType.getIntentByType(INTENT_BUILD)) {
            const buildable = itemType.getIntentByType(INTENT_BUILD).options.buildable;
            const vertices  = buildableVertices({buildable, angle: player.aimAngle, ...player.position});
            drawVertices({context, vertices, strokeStyle: 'rgba(255,255,255,0.5)'});
        } else {
            const vertices = arrowVertices({angle: player.aimAngle, ...player.position});
            drawVertices({context, vertices, strokeStyle: 'rgba(255,255,255,0.5)'});
        }
        context.strokeStyle = 'rgba(255,255,255,.6)';
        context.strokeWidth = '1px';
        circle(context, player.position.x, player.position.y, 16, false, true);
    },
});