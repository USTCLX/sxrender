/**
 * Created by lixiang on 2018/2/26.
 */

import {GraphType} from '../utils/utils';

class Painter {
    constructor(ctx, backCtx, storage) {
        this.backCtx = backCtx;
        this.ctx = ctx;
        this.storage = storage;
        this.objects = this.storage.objects;
    }

    renderAll() {
        var objs = this.objects;
        for (var i = 0, il = objs.length; i < il; i++) {
            switch (objs[i].type) {
                case GraphType.Rect:
                    drawRect(this.ctx, objs[i]);
                    break;
                case GraphType.Circle:
                    break;
                case GraphType.Image:
                    break;
                default:
                    console.error('not match type in render all');
                    break;
            }
        }
    }

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

export default Painter;
