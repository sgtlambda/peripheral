const paper = require('paper/dist/paper-core.min');

import {maxBy, without} from 'lodash';

paper.setup();

const toPaperPath = points => {
    const path = new paper.Path();
    points.forEach(({x, y}) => {
        path.add(new paper.Point(x, y));
    });
    path.closed = true;
    return path;
};

const mapSegments = path => path._segments.map(segment => {
    return {x: segment._point.x, y: segment._point.y};
});

const fromPaperPath = path => {
    if (path._segments) {
        return {
            main: mapSegments(path),
        };
    } else { //compound path
        const children = path._children;
        const main     = maxBy(children, 'area');
        const rest     = without(children, main);
        return {
            main:  mapSegments(main),
            parts: rest.map(path => mapSegments(path))
        };
    }
};

export const subtract = (from, remove) => {
    const path1      = toPaperPath(from);
    const path2      = toPaperPath(remove);
    const subtracted = path1.subtract(path2);
    return fromPaperPath(subtracted);
};