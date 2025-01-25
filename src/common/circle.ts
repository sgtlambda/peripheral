export default function circle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    fill: boolean,
    stroke: boolean = true
): void {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
} 