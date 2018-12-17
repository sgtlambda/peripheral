import circle from '../common/circle';

export default (context, {position, itemType, amount = null}, size = 10) => {

    context.strokeStyle = itemType.color;
    circle(context, position.x, position.y, size, false, true);

    context.font         = '10px monospace';
    context.fillStyle    = 'white';
    context.textAlign    = 'center';
    context.textBaseline = 'top';
    context.fillText(itemType.name, position.x, position.y + size / 2 + 6);

    if (amount) {
        context.fillStyle    = 'white';
        context.font         = '11px monospace';
        context.textBaseline = 'middle';
        context.fillText(amount, position.x, position.y);
    }
}