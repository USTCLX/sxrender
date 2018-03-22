/**
 * Created by lixiang on 2018/2/26.
 */

import {GraphType} from '../utils/utils';

class Painter {
    constructor(canvas, ctx, backCanvas, backCtx, storage) {
        this.canvas = canvas;
        this.backCanvas = backCanvas;
        this.ctx = ctx;
        this.backCtx = backCtx;
        this.storage = storage;
        this.objects = this.storage.objects;
    }

    renderAll() {
        var objs = this.objects;
        //clear zone
        clearCtx(this.ctx,{w:this.canvas.width,h:this.canvas.height});
        for (var i = 0, il = objs.length; i < il; i++) {
            switch (objs[i].type) {
                case GraphType.Rect:
                    drawRect(this.ctx, objs[i]);
                    break;
                case GraphType.Circle:
                    drawCircle(this.ctx, objs[i]);
                    break;
                case GraphType.Image:
                    drawImage(this.ctx,objs[i]);
                    break;
                default:
                    console.error('not match type in render all');
                    break;
            }
        }
    }

}

function clearCtx(ctx,opts) {
    var x, y, w, h;
    var opts = opts || {};
    x = opts.x || 0;
    y = opts.y || 0;
    w = opts.w || 0;
    h = opts.h || 0;
    ctx.clearRect(x, y, w, h)
}

function drawRect(ctx, obj) {
    var x, y, w, h, color;
    x = obj.x;
    y = obj.y;
    w = obj.width;
    h = obj.height;
    color = obj.fill;
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

function drawCircle(ctx, obj) {
    var x, y, radius, color;
    var startAngle = Math.PI * 0;
    var endAngle = Math.PI * 2;
    var anticlockwise = false;

    x = obj.x;
    y = obj.y;
    radius = obj.radius;
    color = obj.fill;

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function drawImage(ctx, obj) {
    var imgObj, x, y, w, h, dx, dy, dw, dh;
    imgObj = obj.imgObj;
    x = obj.x || 0;
    y = obj.y || 0;
    w = obj.w;
    h = obj.h;
    dx = obj.dx || 0;
    dy = obj.dy || 0;
    dw = obj.dw || 0;
    dh = obj.dh || 0;
    ctx.save();
    if (dw && dh) {
        ctx.drawImage(imgObj, x, y, w, h, dx, dy, dw, dh);
    } else if (w && h) {
        ctx.drawImage(imgObj, x, y, w, h);
    } else {
        ctx.drawImage(imgObj, x, y);
    }
    ctx.restore();
}

export default Painter;
