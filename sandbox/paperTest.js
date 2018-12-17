const {maxBy, without} = require("lodash");

const paper = require('paper');

paper.setup();

const _path1 = [[0, 0], [100, 0], [100, 100], [0, 100]];

const _path2 = [[40, -10], [60, -10], [60, 110], [40, 110]];

const convertPath = points => {
    const path = new paper.Path();
    points.forEach(([x, y]) => {
        path.add(new paper.Point(x, y));
    });
    path.closed = true;
    return path;
};

// const stringifyPath = path => path._segments.map(segment => {
//     return [segment._point.x, segment._point.y];
// });

const mapSegments = path => path._segments.map(segment => {
    return {x: segment._point.x, y: segment._point.y};
});

const fromPaperPath = path => {
    if (path.constructor.name !== 'CompoundPath') {
        return {
            main: mapSegments(path),
        };
    } else {
        const children = path._children;
        const main     = maxBy(children, 'area');
        const rest     = without(children, main);
        return {
            main:  mapSegments(main),
            parts: rest.map(path => mapSegments(path))
        };
    }
};

// myPath.add(new paper.Point(0, 0));
// myPath.add(new paper.Point(100, 50));

const path1 = convertPath(_path1);

const path2 = convertPath(_path2);

const subtracted = path1.subtract(path2, {
    // insert: false,
    // trace:  false,
});

// path1.flatten(4);

console.log(fromPaperPath(subtracted));

// console.log(paper.project.exportSVG({asString:true}));