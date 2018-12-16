export default function roundRect(ctx, x, y, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
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