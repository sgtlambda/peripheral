export default (c, vertices) => {
    c.beginPath();
    c.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j++) {
        c.lineTo(vertices[j].x, vertices[j].y);
    }
    c.closePath();
}