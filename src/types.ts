export interface Vector {
    x: number;
    y: number;
}

export interface Bounds {
    min: Vector;
    max: Vector;
}

export default class Renderer {

    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    options: any;
    bounds: Bounds;
}

// export default Renderer;