import Layer from '../Layer.ts';

export default () => new Layer({
    hud:  true,
    over: false,
    render(context, renderer) {
        const canvas                     = renderer.canvas;
        context.globalCompositeOperation = 'source-in';
        context.fillStyle                = "transparent";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';
    }
})