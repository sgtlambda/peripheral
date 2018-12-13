import {Events} from 'matter-js';

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
        gameMouse.x  = screenMouse.x + bounds.min.x;
        gameMouse.y  = screenMouse.y + bounds.min.y;
    };

    Events.on(engine, 'afterUpdate', updateGameMouse);

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