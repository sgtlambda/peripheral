export interface StageGraphicsLayer {
  drawTo(args: { context: CanvasRenderingContext2D }): void;
  
  /** Optional: Returns true if the layer should be removed */
  isFinished?: boolean;
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
    this.cleanupLayers(this.underLayers);
    this.underLayers.forEach(layer => {
      layer.drawTo({context});
    });
  }

  renderOverLayers(context: CanvasRenderingContext2D) {
    this.cleanupLayers(this.overLayers);
    this.overLayers.forEach(layer => {
      layer.drawTo({context});
    });
  }

  /**
   * Remove layers that have finished their lifecycle
   */
  private cleanupLayers(layers: StageGraphicsLayer[]) {
    // Remove all layers that have an isFinished property that evaluates to true
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (typeof layer.isFinished === 'boolean' && layer.isFinished) {
        layers.splice(i, 1);
      }
    }
  }
}