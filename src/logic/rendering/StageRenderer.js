import {Events} from 'matter-js';

import renderItem from './renderItem';

const debugItemSize = 20;

class StageRenderer {

    constructor(stage) {
        this.stage = stage;
    }

    render({context, translate}) {
        context.save();
        context.translate(-translate.x, -translate.y);
        this.stage.strayItems.forEach(item => {
            renderItem(context, item, debugItemSize);
        });
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

export default StageRenderer;