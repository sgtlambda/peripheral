import {Events, Vertices} from 'matter-js';

class PlayerInteractionRenderer {

    constructor({player, playerState}) {
        this.player      = player;
        this.playerState = playerState;
    }

    render({context, translate}) {
        context.save();
        context.translate(-translate.x, -translate.y);
        const vertices = [
            {x: 30, y: 5},
            {x: 30, y: -5},
            {x: 40, y: 0},
        ];
        Vertices.rotate(vertices, this.player.angle, {x: 0, y: 0});
        Vertices.translate(vertices, this.player.position);
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        vertices.forEach(p => context.lineTo(p.x, p.y));
        context.fillStyle = 'white';
        context.fill();
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