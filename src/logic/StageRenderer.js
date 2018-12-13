import {Events} from 'matter-js';

const debugItemSize = 20;

class StageRenderer {

    constructor({stage, render}) {
        this.stage    = stage;
        this.renderer = render;
    }

    render(context) {
        const translate = this.renderer.bounds.min;
        context.translate(-translate.x, -translate.y);
        // ctx.translate(40, 40);
        // ctx.fillStyle = 'red';
        // ctx.fillRect(0, 0, 40, 40);
        this.stage.strayItems.forEach(item => {
            context.fillStyle = item.itemType.color;
            context.fillRect(item.position.x - debugItemSize / 2, item.position.y - debugItemSize / 2,
                debugItemSize, debugItemSize);
            context.font         = '10px monospace';
            context.fillStyle    = 'white';
            context.textAlign    = 'center';
            context.textBaseline = 'top';
            context.fillText(item.itemType.name, item.position.x, item.position.y + debugItemSize / 2);
        });
        // ctx.resetTransform();
        context.translate(translate.x, translate.y);
    }

    attach() {
        this._callback = () => this.render(this.renderer.context);
        Events.on(this.renderer, 'afterRender', this._callback);
        return this;
    }

    detach() {
        if (this._callback) Events.off(this.renderer, 'afterRender', this._callback);
        this._callback = null;
        return this;
    }
}

export default StageRenderer;