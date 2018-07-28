import {Bodies, Constraint} from "matter-js";

export default ({

    x,
    y,
    width = 140,
    height = 16,
    ropeSeparation = 30,
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
            pointA: {x: -ropeSeparation, y: 0},
            pointB: {x: x - ropeSeparation, y: y - ropeLength},
        }, common)),
        Constraint.create(Object.assign({
            pointA: {x: ropeSeparation, y: 0},
            pointB: {x: x + ropeSeparation, y: y - ropeLength},
        }, common)),
    ];

    return {
        body: pendulum,
        constraints,
    };
};