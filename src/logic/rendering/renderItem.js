export default (context, {position, itemType, amount = null}, size = 20) => {

    context.fillStyle = itemType.color;
    context.fillRect(position.x - size / 2, position.y - size / 2,
        size, size);
    context.font         = '10px monospace';
    context.fillStyle    = 'white';
    context.textAlign    = 'center';
    context.textBaseline = 'top';
    context.fillText(itemType.name, position.x, position.y + size / 2);

    if (amount) {
        context.fillStyle    = 'black';
        context.font         = '11px monospace';
        context.textBaseline = 'middle';
        context.fillText(amount, position.x, position.y);
    }
}