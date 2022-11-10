export type StageGraphicsLayer = {
  drawTo(args: { context: CanvasRenderingContext2D }): void;
}

/**
 * Additional / overlay graphics or HUD, seems currently unused
 */
export default class StageGraphics {

  baseLayers: StageGraphicsLayer[];
  overLayers: StageGraphicsLayer[];

  constructor({
                baseLayers = [],
                overLayers = [],
              }: {
    baseLayers?: StageGraphicsLayer[];
    overLayers?: StageGraphicsLayer[];
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

  renderBaseLayers(context: CanvasRenderingContext2D) {
    this.baseLayers.forEach(layer => {
      layer.drawTo({context});
    });
  }

  renderOverLayers(context: CanvasRenderingContext2D) {
    this.overLayers.forEach(layer => {
      layer.drawTo({context});
    });
  }
}