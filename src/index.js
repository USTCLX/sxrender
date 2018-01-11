/**
 * Created by lixiang on 2018/1/7.
 */

import * as Utils from './utils/utils';
import {Animation,InertialAnimation,SpringAnimation} from './Animation'


let SXRender = function (opts){
    var canvas,ctx,opts,id,w,h,bgColor,contentW,contentH,drawScrollBar;
    opts = opts||{};

    id=opts.id||'';
    w=opts.w;
    h=opts.h;
    bgColor=opts.backgroundColor||'';
    contentW = opts.contentW||w;
    contentH = opts.contentH||h;
    drawScrollBar = opts.drawScrollBar||false;

    canvas = (!!id)?document.getElementById(id):document.createElement("canvas");
    canvas.style.backgroundColor = (!!bgColor)?bgColor:'rgba(0,0,0,0)';
    canvas.width=w||500;
    canvas.height=h||500;

    ctx = canvas.getContext("2d");

    this.init(canvas,ctx,contentW,contentH,drawScrollBar);

};

SXRender.prototype = {
    constructor:SXRender,
    init:function(canvas,ctx,contentW,contentH,drawScrollBar){
        //canvas
        this.canvas = canvas;
        this.ctx = ctx;

        //basic attrs
        this.width = canvas.width;
        this.height = canvas.height;
        this.dragging = false;        //drag一个物体
        this.scratching = false;     //抓住背景，可拖动内容整体滚动
        this.selectObjId = 0;
        this.contentW = contentW;    //内容宽度
        this.contentH = contentH;    //内容高度
        this.drawScrollBar = drawScrollBar;
        this.backgroundImg = {};
        this.scrollVEnabled = !!(this.contentH&&this.contentH>this.height);
        this.scrollHEnabled = !!(this.contentW&&this.contentW>this.width);
        this.limitX = {
            min:this.width-this.contentW,
            max:0
        };
        this.limitY = {
            min:this.height-this.contentH,
            max:0
        };

        this.mouseDownPos = {
            x:0,
            y:0
        };
        this.springOffset = {
            x:0,                     //X方向偏移，用于橡皮擦扒的效果。
            y:0                      //Y方向偏移，用于橡皮擦扒的效果。
        };
        this.contentOffset = {
            x:0,
            y:0                      //内容的偏移
        };

        //objs list
        this.objs = [];

        //animation
        this._animation = null;     //动画
        this._contentVelcoity = {   //内容滚动的速度
            y:0,
            x:0
        };
        this._frame = {             //保存旧的鼠标坐标,用于获取速度
            x:0,
            y:0,
        };
        this._ticker = null;        //内部定时器,用于捕获速度
        this._timeStamp = 0;        //保存上次move的时刻的时间戳


        //events
        this.canvas.addEventListener('mousedown', mouseDownHandler.bind(this), false);
        this.canvas.addEventListener('mouseup', mouseUpHandler.bind(this), false);
        this.canvas.addEventListener('mousemove', mouseMoveHandler.bind(this), false);
        this.canvas.addEventListener('mouseout',mouseUpHandler.bind(this),false);
    },
    //绘制画板背景
    drawBackground:function(opts){
        if(!!opts){
            this.backgroundImg.content = opts.imgObj;
            this.backgroundImg.sx = opts.sx||0;
            this.backgroundImg.sy = opts.sy||0;
            this.backgroundImg.sw = opts.sw||0;
            this.backgroundImg.sh = opts.sh||0;
            this.backgroundImg.dx = opts.dx||0;
            this.backgroundImg.dy = opts.dy||0;
            this.backgroundImg.dw = opts.dw||this.width;
            this.backgroundImg.dh = opts.dh||this.height;
        }

        this.ctx.save();
        this.ctx.setTransform(1,0,0,1,0,0);
        if(!this.backgroundImg.content){
            return;
        }
        if(this.backgroundImg.sw&&this.backgroundImg.sh){
            this.ctx.drawImage(this.backgroundImg.content,this.backgroundImg.sx,this.backgroundImg.sy,this.backgroundImg.sw,this.backgroundImg.sh,this.backgroundImg.dx,this.backgroundImg.dy,this.backgroundImg.dw,this.backgroundImg.dh);

        }else{
            this.ctx.drawImage(this.backgroundImg.content,this.backgroundImg.dx,this.backgroundImg.dy,this.backgroundImg.dw,this.backgroundImg.dh);
        }
        this.ctx.restore();
    },
    /**
     * 绘制小球函数
     * @param  {obj} ctx    绘图上下文
     * @param  {num} x      x坐标
     * @param  {num} y      y坐标
     * @param  {num} radius 半径
     * @param  {string} color  颜色
     * @return {[type]}        [description]
     */
    drawBall:function(opts){
        var x,y,radius,color;
        var opts = opts||{};
        var startAngle = Math.PI*0;
        var endAngle = Math.PI*2;
        var anticlockwise = false;

        x = opts.x+this.springOffset.x;
        y = opts.y+this.springOffset.y;
        radius = opts.radius;
        color = opts.color;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    },
    /**
     * 清空一片区域
     */
    clearCtx:function(opts){
        var x,y,w,h;
        var opts = opts||{};
        x = opts.x||0;
        y = opts.y||0;
        w = opts.w||this.width;
        h = opts.h||this.height;
        this.ctx.clearRect(x, y, w, h)
    },
    /**
     * 画一个矩形
     */
    drawRect:function(opts){
        var x,y,w,h,color;
        var opts = opts||{};
        x = opts.x+this.springOffset.x;
        y = opts.y+this.springOffset.y;
        w = opts.w;
        h = opts.h;
        color = opts.color;
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.restore();
    },
    /**
     * 绘制图片
     */
    drawImage:function(opts){
        var imgObj,x,y,w,h,dx,dy,dw,dh;
        var opts = opts||{};
        imgObj = opts.imgObj;
        x = opts.x||0;
        y = opts.y||0;
        w = opts.w;
        h = opts.h;
        dx = opts.dx||0;
        dy = opts.dy||0;
        dw = opts.dw||0;
        dh = opts.dh||0;
        this.ctx.save();
        if(dw&&dh){
            this.ctx.drawImage(imgObj,x,y,w,h,dx,dy,dw,dh);
        }else if(w&&h){
            x += this.springOffset.x;
            y += this.springOffset.y;
            this.ctx.drawImage(imgObj, x, y, w, h);
        }else{
            this.ctx.drawImage(imgObj, x, y);
        }
        this.ctx.restore();
    },
    /**
     * 重新绘制
     * @return {[type]} [description]
     */
    reRender:function(){
        this.clearCtx();
        this.backgroundImg.content?this.drawBackground():null;
        this.ctx.setTransform(1,0,0,1,this.contentOffset.x,this.contentOffset.y);
        var objs = this.objs||[];
        for(var i=0,il=objs.length;i<il;i++){
            switch(objs[i].type){
                case 'ball':
                    this.drawBall(objs[i]);
                    break;
                case 'rect':
                    this.drawRect(objs[i]);
                    break;
                case 'image':
                    this.drawImage(objs[i]);
                    break;
                default:
                    console.log('miss in reRender');
                    break;
            }
        }
        this.ctx.setTransform(1,0,0,1,0,0);
        // this.drawScrollBar?this._drawProgress():'';
    },
    findObjById:function(id){
        for(var i=0,il=this.objs.length;i<il;i++){
            if(this.objs[i].id===id){
                return this.objs[i];
            }
        }
        return null;
    },
    add:function(obj){
        var o = {};
        o = Object.assign(o,obj,{
            id:Utils.genGUID()
        });
        this.objs.push(o);
    },
    _drawProgress:function() {
        var top,left,width,height,springOffsetY;
        springOffsetY = (this.springOffset.y>0)?-this.springOffset.y:(-2*this.springOffset.y);
        width = 4;
        height  = Math.round((this.height*this.height)/this.contentH)-Math.abs(this.springOffset.y);
        height = (height<10)?10:height;
        top = Math.round((-this.contentOffset.y*(this.height))/this.contentH)+springOffsetY;
        left = this.width-width;

        this.drawRect({
            x:left,
            y:top,
            w:width,
            h:height,
            color:'#888888'
        })
    }
};

/**
 * 鼠标按下事件。
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseDownHandler(e){
    var pos = Utils.getRelativeRect(e);

    this.selectObjId = Utils.checkClickElm(this.objs,pos,this.contentOffset);
    this.mouseDownPos = pos;
    if(!!this.selectObjId){
        //选中物体
        this.dragging = true;
    }else{
        //拖动界面
        this.scratching = true;

        this._animation?this._animation.stop():null;
        // clearInterval(this._animation); //清除动画
        clearInterval(this._ticker);

        this._contentVelcoity.y = 0;
        this._contentVelcoity.x = 0;

        //跟踪鼠标，获取速度，50ms获取一次
        if(this.scrollVEnabled||this.scrollHEnabled){
            this._timeStamp = Date.now();
            this._frame.y = this.mouseDownPos.y;
            this._frame.x = this.mouseDownPos.x;
            this._ticker = setInterval(function(){
                var now,elapsed,delta,v;
                now = Date.now();
                elapsed = now - this._timeStamp;
                this._timeStamp = now;
                delta = this.mouseDownPos.y-this._frame.y;
                v = 1000*delta/(1+elapsed);
                this._contentVelcoity.y = 0.8*v + 0.2*this._contentVelcoity.y;
                delta = this.mouseDownPos.x - this._frame.x;
                v = 1000*delta/(1+elapsed);
                this._contentVelcoity.x = 0.8*v+0.2*this._contentVelcoity.x;
                this._frame.y = this.mouseDownPos.y;
                this._frame.x = this.mouseDownPos.x;
            }.bind(this),50);
        }
    }
}

/**
 * 鼠标抬起事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseUpHandler(e){
    if(this.dragging){
        this.dragging = false;
        this.selectObjId = 0;
    }else if(this.scratching){
        //扒页面
        this.scratching = false;
        //清空速度计算的轮训
        clearInterval(this._ticker);

        if(this.scrollVEnabled||this.scrollHEnabled){
            if(this.springOffset.y!==0||this.springOffset.x!==0){
                //开启弹跳动画
                var self = this;
                this._animation = new SpringAnimation(null,'',0,12,180,this.springOffset,{x:0,y:0},2000);
                this._animation.onFrameCB = function(){
                    self.springOffset = this.state.curValue;
                    self.reRender();
                };
                this._animation.start();
            }else{
                //开始惯性滚动
                var amplitude = {};
                var targetPos = {};
                var v = this._contentVelcoity;
                if(v.y>30||v.y<-30||v.x>30||v.x<-30){
                    amplitude.x = (v.x<-30||v.x>30)?0.8*v.x:0;
                    amplitude.y = (v.y<-30||v.y>30)?0.8*v.y:0;
                    targetPos.x = Math.round(this.contentOffset.x+amplitude.x);
                    targetPos.y = Math.round(this.contentOffset.y+amplitude.y);
                    //开启动画
                    var self = this;
                    this._animation= new InertialAnimation(null,'',this.contentOffset,targetPos,amplitude);
                    this._animation.onFrameCB = function(){
                        //检查是否越界
                        var xFlag = false;
                        var yFlag = false;
                        var c;
                        self.contentOffset = this.state.curValue;
                        c = self.contentOffset;
                        if(c.x>self.limitX.max||c.x<self.limitX.min){
                            c.x = (c.x>self.limitX.max)?self.limitX.max:self.limitX.min;
                            xFlag = true;
                        }
                        if(c.y>self.limitY.max||c.y<self.limitY.min){
                            c.y = (c.y>self.limitY.max)?self.limitY.max:self.limitY.min;
                            yFlag = true;
                        }
                        if(xFlag&&yFlag){
                            this.stop();
                        }
                        self.reRender();
                    };
                    this._animation.start();
                }
            }
        }
    }
}

/**
 * 鼠标移动事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseMoveHandler(e){
    var dragging,
        selectObjId,
        selectObj,
        pos,              //鼠标点击在canvas内的位置
        diff = {x:0,y:0}; //鼠标位置间的差值

    pos = Utils.getRelativeRect(e);

    if(this.dragging){
        //选中物体
        diff.x = pos.x - this.mouseDownPos.x;
        diff.y = pos.y - this.mouseDownPos.y;
        this.mouseDownPos.x = pos.x;
        this.mouseDownPos.y = pos.y;
        selectObj = this.findObjById(this.selectObjId);
        selectObj.x += diff.x;
        selectObj.y += diff.y;
        this.reRender();

    }else if(this.scratching){
        //扒动页面

        if(this.scrollVEnabled||this.scrollHEnabled){
            diff.x = pos.x-this.mouseDownPos.x;
            diff.y = pos.y-this.mouseDownPos.y;
            if(this.scrollVEnabled){
                if(diff.y<0){
                    //内容向上
                    if(this.contentOffset.y<=this.limitY.min){
                        this.contentOffset.y = this.limitY.min;
                        //到达下边缘
                        this.springOffset.y = Utils.rubberBanding(diff.y,this.height);
                    }else{
                        this.mouseDownPos.y = pos.y;
                        this.contentOffset.y += diff.y;
                    }
                }else{
                    //内容向下
                    if(this.contentOffset.y>=this.limitY.max){
                        //到达上边缘
                        this.contentOffset.y = this.limitY.max;
                        this.springOffset.y = Utils.rubberBanding(diff.y,this.height);
                    }else{
                        this.mouseDownPos.y = pos.y;
                        this.contentOffset.y += diff.y;
                    }
                }
            }

            if(this.scrollHEnabled){
                if(diff.x<0){
                    //内容向左
                    if(this.contentOffset.x<=this.limitX.min){
                        //到达左边缘
                        this.contentOffset.x = this.limitX.min;
                        this.springOffset.x = Utils.rubberBanding(diff.x,this.width);
                    }else{
                        this.mouseDownPos.x = pos.x;
                        this.contentOffset.x += diff.x;
                    }
                }else{
                    //内容向右
                    if(this.contentOffset.x>=this.limitX.max){
                        //到达右边缘
                        this.contentOffset.x = this.limitX.max;
                        this.springOffset.x = Utils.rubberBanding(diff.x,this.width);
                    }else{
                        this.mouseDownPos.x = pos.x;
                        this.contentOffset.x += diff.x;
                    }
                }
            }
            this.reRender()
        }

    }
}

/**
 * 鼠标移除canvas事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseOutHandler(e){
    if(this.dragging){
        this.dragging = false;
    }
    if(this.scratching){
        this.scratching = false;
    }
    this.selectObjId = 0;
}

export default SXRender;
