import Layer from '../Layer';

import renderItem from '../renderItem';

import Stage from "../../logic/Stage";

const renderBuilding = (context: CanvasRenderingContext2D, building) => {
  const position       = building.body.position;
  context.font         = '10px monospace';
  context.fillStyle    = 'rgba(255,255,255,.4)';
  context.textAlign    = 'center';
  context.textBaseline = 'middle';
  context.fillText(building.buildable.name, position.x, position.y);
};

export const createStageLayers = (stage: Stage) => [
  // "under" layer - goes under matter.js renderer
  new Layer({
    over: false,
    render(context) {
      // Render base layers - currently unused
      stage.graphics.renderUnderLayers(context);
    }
  }),
  new Layer({
    render(context) {
      // Render stray items
      stage.strayItems.forEach(item => {
        renderItem(context, item);
      });
      // Render buildings
      stage.buildings.forEach(building => {
        renderBuilding(context, building);
      });
      // Render "over layers" (not sure if currently used)
      stage.graphics.renderOverLayers(context);
    }
  }),
];