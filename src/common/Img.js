export default class Img {
    constructor({src, x: xOffset = 0, y: yOffset = 0, w, h}) {
        this.src    = src;
        this.image  = new Image();
        this.loaded = false;
        this.bitmap = null;
        this.image.addEventListener('load', this.onLoad.bind(this));
        this.image.src = src;
        this.xOffset   = xOffset;
        this.yOffset   = yOffset;
        this.w         = w;
        this.h         = h;
    }

    onLoad() {
        this.loaded = true;
        if (!this.w) this.w = this.image.width;
        if (!this.h) this.h = this.image.height;
        createImageBitmap(this.image).then(bitmap => {
            this.bitmap = bitmap;
        });
    }

    drawTo({context, x = 0, y = 0, w = this.w, h = this.h}) {
        x += this.xOffset;
        y += this.yOffset;
        if (!this.bitmap) return false;
        context.drawImage(this.bitmap, x, y, w, h);
    }
}