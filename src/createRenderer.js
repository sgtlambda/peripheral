// create a renderer
import Render from "../fork/renderer";

module.exports = ({element, engine}) => {

    const render = Render.create({
        element: document.body,
        engine:  engine,
        options: {
            width:               900,
            height:              600,
            pixelRatio:          2,
            background:          '#000',
            wireframeBackground: '#fff',
            hasBounds:           true,
            enabled:             true,
            wireframes:          false,
            showSleeping:        true,
            showDebug:           false,
            showBroadphase:      false,
            showBounds:          false,
            showVelocity:        false,
            showCollisions:      false,
            showSeparations:     false,
            showAxes:            false,
            showPositions:       false,
            showAngleIndicator:  false,
            showIds:             false,
            showShadows:         false,
            showVertexNumbers:   false,
            showConvexHulls:     false,
            showInternalEdges:   false,
            showMousePosition:   false,
        }
    });

    return render;
};