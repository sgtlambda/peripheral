import Layer from '../Layer';

export default () => ({
    before: new Layer({
        hud:           true,
        over:          false,
        persistMatrix: true,
        render(context, renderer, camera) {
            context.save();
            camera.rotate(context);
            console.log(context);
        },
    }),
    after:  new Layer({
        hud:           true,
        over:          true,
        persistMatrix: true,
        render(context) {
            context.restore();
        },
    }),
})