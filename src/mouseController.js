import {Events, Vector} from 'matter-js';

export default ({
    emitter = window,
    camera, engine,
} = {}) => {

    const screenMouse = {x: 0, y: 0};
    const gameMouse   = {x: 0, y: 0};

    const mousemove = e => {
        screenMouse.x = e.pageX;
        screenMouse.y = e.pageY;
    };

    const updateGameMouse = () => {
        const bounds = camera.bounds;

        const _gameMouseRotate = Vector.rotateAbout(screenMouse, camera.currentAngle, camera.onscreenCenter);

        const _gameMouse = Vector.add(_gameMouseRotate, bounds.min);

        gameMouse.x = _gameMouse.x;
        gameMouse.y = _gameMouse.y;
    };

    Events.on(engine, 'beforeUpdate', updateGameMouse);

    emitter.addEventListener('mousemove', mousemove);

    return {
        screenMouse,
        gameMouse,
        destroy() {
            emitter.removeEventListener('mousemove', mousemove);
            Events.off(engine, 'afterStep', updateGameMouse);
        },
    };
};