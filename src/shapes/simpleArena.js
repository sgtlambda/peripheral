import {cloneDeep} from 'lodash';

import {Vertices} from 'matter-js';

export default ({
    width = 800,
    height = 1000,
    walls = 80,
    halfwayGap = 3,
    bezelW = 40,
    bezelH = 80,
} = {}) => {

    const topHalf = Vertices.translate([
        {x: 0, y: 0},
        {x: width, y: 0},
        {x: width, y: height / 2 - halfwayGap},
        {x: width - walls, y: height / 2 - halfwayGap},
        {x: width - walls, y: walls + bezelH},
        {x: width - walls - bezelW, y: walls},
        {x: walls + bezelW, y: walls},
        {x: walls, y: walls + bezelH},
        {x: walls, y: height / 2 - halfwayGap},
        {x: 0, y: height / 2 - halfwayGap},
    ], {
        x: -width / 2, y: -height / 2
    });

    const bottomHalf = Vertices.rotate(cloneDeep(topHalf), Math.PI, {x: 0, y: 0});

    return [
        topHalf,
        bottomHalf,
    ];
};