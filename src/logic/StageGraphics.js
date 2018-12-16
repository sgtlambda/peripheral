export default class StageGraphics {
    constructor({
        baseLayers = [],
        overLayers = [],
    } = {}) {
        this.baseLayers = baseLayers;
        this.overLayers = overLayers;
    }

    addBaseLayer(layer) {
        this.baseLayers.push(layer);
    }

    addOverLayer(layer) {
        this.overLayers.push(layer);
    }

    renderBaseLayers(context) {
        this.baseLayers.forEach(layer => {
            layer.drawTo({context});
        });
    }

    renderOverLayers(context) {
        this.overLayers.forEach(layer => {
            layer.drawTo({context});
        });
    }
}