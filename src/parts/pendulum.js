import {Bodies, Constraint} from "matter-js";

export default ({

    x,
    y,
    width = 140,
    height = 16,
    ropeSeparationAtSwing = 30,
    ropeSeparationAtMount = 0,
    ropeLength = 100,
    stiffness = .3,
    damping = .3,

}) => {

    const pendulum = Bodies.rectangle(x, y, width, height, {
        render: {
            fillStyle:   '#558884',
            strokeStyle: '#558884',
            lineWidth:   1
        },
    });

    const common = {
        bodyA:  pendulum,
        length: ropeLength,
        stiffness,
        damping,
        render: {
            type: 'line',
        },
    };

    const constraints = [
        Constraint.create(Object.assign({
            pointA: {x: -ropeSeparationAtSwing, y: 0},
            pointB: {x: x - ropeSeparationAtMount, y: y - ropeLength},
        }, common)),
        Constraint.create(Object.assign({
            pointA: {x: ropeSeparationAtSwing, y: 0},
            pointB: {x: x + ropeSeparationAtMount, y: y - ropeLength},
        }, common)),
    ];

    return {
        body: pendulum,
        constraints,
    };
};