/**
 * Created by lixiang on 2018/2/26.
 */

import {GraphType} from '../utils/utils';

const SCROLLBAR_WIDTH = 4;
const SCROLLBAR_COLOR = "#e00";

class Painter {
    constructor(canvas, backCanvas, storage, params, options) {
        this.canvas = canvas;
        this.backCanvas = backCanvas;
        this.storage = storage;
        this.objects = this.storage.objects;
        this.params = params;
        this.options = options;

        this.ctx = canvas.getContext('2d');
        this.bgCtx = backCanvas.getContext('2d');
    }

    renderAll() {
        let objs = this.objects;
        let params = this.params;
        let options = this.options;
        let ctx = this.ctx;

        //clear zone
        this.clearCtx(ctx,{w:options.width,h:options.height});

        for (var i = 0, il = objs.length; i < il; i++) {
            switch (objs[i].type) {
                case GraphType.Rect:
                    this.drawRect(ctx, objs[i]);
                    break;
                case GraphType.Circle:
                    this.drawCircle(ctx, objs[i]);
                    break;
                case GraphType.Image:
                    this.drawImage(ctx, objs[i]);
                    break;
                default:
                    console.error('not match type in render all');
                    break;
            }
        }

        //demo
        ctx.setTransform(1, 0, 0, 1, params.x, params.y);
        ctx.save();
        ctx.fillStyle = "#f00";
        ctx.fillRect(20, 20, 20, 20);
        ctx.fillRect(20, 100, 20, 20);
        ctx.fillRect(20, 200, 20, 20);
        ctx.fillRect(20, 300, 20, 20);
        ctx.fillRect(20, 500, 20, 20);
        ctx.fillRect(20, 600, 20, 20);
        ctx.restore();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        //draw scroll bar
        if(params.scroll){
            this.drawScrollBar(ctx, params, options);
        }
    }

    clearCtx(ctx,opts){
        let x, y, w, h;
        x = opts.x || 0;
        y = opts.y || 0;
        w = opts.h || 0;
        h = opts.h || 0;
        ctx.save();
        ctx.clearRect(x, y, w, h);
        ctx.restore();
    }

    drawRect(ctx,obj){
        let x, y, w, h, color;
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

    drawCircle(ctx,obj){
        let x, y, radius, color;
        let startAngle = Math.PI * 0;
        let endAngle = Math.PI * 2;
        let anticlockwise = false;

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

    drawImage(ctx,obj){
        let imgObj, x, y, w, h, dx, dy, dw, dh;
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

    //todo:scroll bar的逻辑还没有完善，还需要加入淡入淡出
    drawScrollBar(ctx, params, options){
        let height,
            width,
            x,
            y,
            color = SCROLLBAR_COLOR;
        let w1 = options.width,      //视口宽高
            h1 = options.height,
            w2 = options.contentWidth,//内容宽高
            h2 = options.contentHeight;

        let x2 = params.x,   //内容坐标
            y2 = params.y,
            overflowX = params.overflowX,
            overflowY = params.overflowY;

        if (params.scrollX) {

        }

        if (params.scrollY) {
            height = h1 * h1 / h2;
            // height = (height < 10) ? 10 : height;

            width = SCROLLBAR_WIDTH;

            x = w1 - SCROLLBAR_WIDTH;

            y = -height * y2 / h2;
            y = (y < 0) ? 0 : y;
        }

        ctx.save();
        ctx.fillStyle = color;
        console.log('y','height',y,height);
        ctx.fillRect(x, y, width, height);
        ctx.restore();
    }
}


export default Painter;
