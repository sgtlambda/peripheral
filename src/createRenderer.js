// create a renderer
import Render from "../fork/renderer";

module.exports = ({element, engine}) => Render.create({
    element: document.body,
    engine:  engine,
    options: {
        width:               800,
        height:              400,
        pixelRatio:          2,
        background:          '#e0e0e0',
        wireframeBackground: '#fff',
        hasBounds:           false,
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