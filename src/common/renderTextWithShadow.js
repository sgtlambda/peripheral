export default ({context, text, x, y, shadow = 'black'}) => {
    const previousFillStyle = context.fillStyle;
    context.fillStyle       = shadow;
    context.fillText(text, x, y + 1);
    context.fillStyle = previousFillStyle;
    context.fillText(text, x, y);
};