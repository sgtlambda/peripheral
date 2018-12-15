import {Events, Vertices} from 'matter-js';

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

export const drawVertices = ({context, vertices, fillStyle = 'white'}) => {
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    vertices.forEach(p => context.lineTo(p.x, p.y));
    context.fillStyle = fillStyle;
    context.fill();
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
            drawVertices({context, vertices, fillStyle: 'rgba(255,255,255,0.3)'});
        } else {
            const vertices = arrowVertices({angle: this.player.angle, ...this.player.position});
            drawVertices({context, vertices, fillStyle: 'rgba(255,255,255,0.3)'});
        }

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