export interface StageGraphicsLayer {
  drawTo(args: { context: CanvasRenderingContext2D }): void;
}

export default class StageGraphics {

  underLayers: StageGraphicsLayer[];
  overLayers: StageGraphicsLayer[];

  constructor(
    {
      underLayers = [],
      overLayers = [],
    }: {
      underLayers?: StageGraphicsLayer[];
      overLayers?: StageGraphicsLayer[];
    } = {}) {
    this.underLayers = underLayers;
    this.overLayers  = overLayers;
  }

  addUnderLayer(layer: StageGraphicsLayer): void {
    this.underLayers.push(layer);
  }

  addOverLayer(layer: StageGraphicsLayer): void {
    this.overLayers.push(layer);
  }

  renderUnderLayers(context: CanvasRenderingContext2D) {
    this.underLayers.forEach(layer => {
      layer.drawTo({context});
    });
  }

  renderOverLayers(context: CanvasRenderingContext2D) {
    this.overLayers.forEach(layer => {
      layer.drawTo({context});
    });
  }

  // TODO cleanup (invoke `isFinished` on the layer to see if it should be removed)
}