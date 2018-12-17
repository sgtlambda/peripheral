import Layer from '../Layer';

import renderItem from '../renderItem';

const renderBuilding = (context, building) => {
    const position       = building.body.position;
    context.font         = '10px monospace';
    context.fillStyle    = 'rgba(255,255,255,.4)';
    context.textAlign    = 'center';
    context.textBaseline = 'middle';
    context.fillText(building.buildable.name, position.x, position.y);
};

export default ({stage}) => [
    new Layer({
        over: false,
        render(context) {
            stage.graphics.renderBaseLayers(context);
        }
    }),
    new Layer({
        render(context) {
            stage.strayItems.forEach(item => {
                renderItem(context, item);
            });
            stage.buildings.forEach(building => {
                renderBuilding(context, building);
            });
            stage.graphics.renderOverLayers(context);
        }
    }),
];