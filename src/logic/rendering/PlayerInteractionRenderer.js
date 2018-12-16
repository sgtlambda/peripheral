import {Events, Vertices} from 'matter-js';

import circle from '../../common/circle';

export const arrowVertices = ({angle, x, y}) => {
    const vertices = [
        {x: 30, y: 5},
        {x: 30, y: -5},
        {x: 40, y: 0},
    ];
    Vertices.rotate(vertices, angle, {x: 0, y: 0});
    Vertices.translate(vertices, {x, y});
    return vertices;
};

export const buildableVertices = ({buildable, offset = 35, size = 32, angle, x, y}) => {
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

class PlayerInteractionRenderer {

    constructor({player, playerState}) {
        this.player      = player;
        this.playerState = playerState;
    }

    render({context, translate}) {

        context.save();

        context.translate(-translate.x, -translate.y);

        const itemType = this.playerState.getActiveSlot().itemType;

        if (itemType && itemType.getBuildIntent()) {
            const buildable = itemType.getBuildIntent().options.buildable;
            const vertices  = buildableVertices({buildable, angle: this.player.angle, ...this.player.position});
            drawVertices({context, vertices, strokeStyle: 'rgba(255,255,255,0.5)'});
        } else {
            const vertices = arrowVertices({angle: this.player.angle, ...this.player.position});
            drawVertices({context, vertices, strokeStyle: 'rgba(255,255,255,0.5)'});
        }

        context.strokeStyle = 'rgba(255,255,255,.6)';
        context.strokeWidth = '1px';
        circle(context, this.player.position.x, this.player.position.y, 24, false, true);

        context.restore();
    }

    attach(renderer) {
        this._callback = () => this.render({context: renderer.context, translate: renderer.bounds.min});
        Events.on(renderer, 'afterRender', this._callback);
        return this;
    }

    detach(renderer) {
        if (this._callback) Events.off(renderer, 'afterRender', this._callback);
        this._callback = null;
        return this;
    }
}

export default PlayerInteractionRenderer;