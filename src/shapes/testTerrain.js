// import {range} from 'lodash';

const baseY     = 300 - 8;
const rampWidth = 50;
const gapDepth  = 200;
const gapX      = 290;
const gapWidth  = 320;
const gapStep   = 20;

export default [
    [
        {x: 0, y: baseY},
        {x: gapStep, y: baseY + 5},
        {x: gapStep * 2, y: baseY + 8},
        {x: gapStep * 3, y: baseY + 5},
        {x: gapStep * 4, y: baseY + 2},
        {x: gapStep * 5, y: baseY + 4},
        {x: gapStep * 6, y: baseY + 5},
        {x: gapStep * 7, y: baseY - 4},
        {x: gapStep * 8, y: baseY - 5},
        {x: gapStep * 9, y: baseY},
        {x: gapX, y: baseY},
        {x: gapX + rampWidth, y: baseY},
        {x: gapX + rampWidth, y: baseY + 20},
        {x: gapX, y: baseY + 30},
        {x: gapX, y: baseY + gapDepth},
        {x: gapX + gapWidth, y: baseY + gapDepth},
        {x: gapX + gapWidth, y: baseY + 30},
        {x: gapX + gapWidth - rampWidth, y: baseY + 20},
        {x: gapX + gapWidth - rampWidth, y: baseY},

        {x: gapX + gapWidth + 400, y: baseY},
        {x: gapX + gapWidth + 400, y: baseY + gapDepth + 100},
        {x: 0, y: baseY + gapDepth + 100},
    ], [
        {x: 620, y: 205},
        {x: 625, y: 200},
        {x: 745, y: 200},
        {x: 750, y: 205},
        {x: 740, y: 220},
        {x: 630, y: 220},
    ]
];