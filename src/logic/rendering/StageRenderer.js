import {Events} from 'matter-js';

import Img from '../../common/Img';

import paperTexture from '../../white-linen-paper-texture.jpg';

import renderItem from './renderItem';

const debugItemSize = 20;

const paper = new Img({src: paperTexture, w: 1500, h: 1000});

const renderBuilding = (context, building) => {
    const position       = building.body.position;
    context.font         = '10px monospace';
    context.fillStyle    = 'rgba(255,255,255,.4)';
    context.textAlign    = 'center';
    context.textBaseline = 'middle';
    context.fillText(building.buildable.name, position.x, position.y);
};

class StageRenderer {

    constructor(stage) {
        this.stage = stage;
    }

    beforeRender({canvas, context, translate}) {
        context.globalCompositeOperation = 'source-in';
        context.fillStyle                = "transparent";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';
        context.save();
        context.translate(-translate.x, -translate.y);
        this.stage.graphics.renderBaseLayers(context);
        context.restore();
    }

    afterRender({context, translate}) {
        context.save();
        context.translate(-translate.x, -translate.y);
        this.stage.strayItems.forEach(item => {
            renderItem(context, item, debugItemSize);
        });
        this.stage.buildings.forEach(building => {
            renderBuilding(context, building);
        });
        this.stage.graphics.renderOverLayers(context);
        context.restore();

        // context.globalCompositeOperation = 'overlay';
        // context.globalAlpha              = .3;
        // paper.drawTo({context});
        // context.globalCompositeOperation = 'source-over';
        // context.globalAlpha              = 1;
    }

    attach(renderer) {
        this._beforeRender = () => this.beforeRender({
            canvas:    renderer.canvas,
            context:   renderer.context,
            translate: renderer.bounds.min
        });
        this._afterRender  = () => this.afterRender({
            canvas:    renderer.canvas,
            context:   renderer.context,
            translate: renderer.bounds.min
        });
        Events.on(renderer, 'beforeRender', this._beforeRender);
        Events.on(renderer, 'afterRender', this._afterRender);
        return this;
    }

    detach(renderer) {
        if (this._beforeRender) Events.off(renderer, 'beforeRender', this._beforeRender);
        if (this._afterRender) Events.off(renderer, 'afterRender', this._afterRender);
        this._beforeRender = null;
        this._afterRender  = null;
        return this;
    }
}

export default StageRenderer;