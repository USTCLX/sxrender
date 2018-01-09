/**
 * Created by lixiang on 2018/1/7.
 */

import * as Utils from './utils/utils';
import Animation from './Animation/Animation';
import InertialAnimation from './Animation/InertialAnimation'

const  timeConstant = 500; //时间常量，用于惯性滚动的计算中,IOS中为325


/**
 * 鼠标按下事件。
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseDownHandler(e){
    var pos = Utils.getRelativeRect(e);

    this.selectObjId = Utils.checkClickElm(this.objs,pos,this.contentOffset)
    this.mouseDownPos = pos;
    if(!!this.selectObjId){
        //选中物体
        this.dragging = true;
    }else{
        //拖动界面
        this.scratching = true;

        this._animation?this._animation.stop():null;
        clearInterval(this._animation); //清除动画
        clearInterval(this._ticker);

        this._contentVelcoity.y = 0;
        this._contentVelcoity.x = 0;
        this._amplitude.y = 0;
        this._amplitude.x = 0;

        //跟踪鼠标，获取速度，50ms获取一次
        this._timeStamp = Date.now();
        this._frame.y = pos.y;
        this._ticker = setInterval(function(){
            var now,elapsed,delta,v;
            now = Date.now();
            elapsed = now - this._timeStamp;
            this._timeStamp = now;
            delta = this.mouseDownPos.y-this._frame.y;
            this._frame.y = this.mouseDownPos.y;
            v = 1000*delta/(1+elapsed);
            this._contentVelcoity.y = 0.8*v + 0.2*this._contentVelcoity.y;

        }.bind(this),50)

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

        var timeTick = 0,
            timeStep = 16,
            p = 0,
            limitOffsetY = 0.0001;

        if(this.springOffset.y!==0){

            //执行spring动画
            clearInterval(this._animation);          //清除正在进行的其他动画
            this._animation = setInterval(function(){
                if(Math.abs(this.springOffset.y)>limitOffsetY){
                    p = this._springTimeFun(timeTick/1000);
                    timeTick += timeStep;

                    this.springOffset.y = (1-p)*this.springOffset.y;
                    // console.log('springOffset.y',this.springOffset.y)
                    this.reRender();
                }else{
                    this.springOffset.y = 0;
                    this.reRender();
                    //清除引用
                    clearInterval(this._animation);
                    this._animation = null;
                    timeTick = null;
                        p = null;
                }
            }.bind(this),timeStep)
        }else{
            //开始惯性滚动
            var amplitude;
            if(this._contentVelcoity.y>30||this._contentVelcoity.y<-30){
                amplitude = 0.8*this._contentVelcoity.y;
                // this._timeStamp = Date.now();
                this._targetPos.y = Math.round(this.contentOffset.y+amplitude);

                //开启动画
                var self = this;
                this._animation= new InertialAnimation(null,'',this.contentOffset.y,this._targetPos.y,amplitude);
                this._animation.onFrameCB = function(){
                    //检查是否越界
                    if(self.contentOffset.y>0){
                        self.contentOffset.y = 0;
                        self._animation.stop();
                    }else if(self.contentOffset.y<(self.height-self.contentH)){
                        self.contentOffset.y = self.height-self.contentH;
                        self._animation.stop();
                    }else{
                        self.contentOffset.y = this.state.curValue;
                    }
                    self.reRender();
                };
                this._animation.start();
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
        // console.log('event',e.offsetY);

        diff.x = pos.x-this.mouseDownPos.x;
        diff.y = pos.y-this.mouseDownPos.y;

        if(diff.y<0){
            //内容向上
            if(this.contentOffset.y<=(this.height-this.contentH)){
                this.contentOffset.y = Math.floor(this.height-this.contentH);
                //到达下边缘
                this.springOffset.y = Utils.rubberBanding(diff.y,this.height);
            }else{
                this.mouseDownPos.x = pos.x;
                this.mouseDownPos.y = pos.y;
                this.contentOffset.y += diff.y;
            }

        }else{
            //内容向下
            if(this.contentOffset.y>=0){
                //到达上边缘
                this.contentOffset.y = 0;
                this.springOffset.y = Utils.rubberBanding(diff.y,this.height);
            }else{
                this.mouseDownPos.x = pos.x;
                this.mouseDownPos.y = pos.y;
                this.contentOffset.y += diff.y;
            }
        }

        //记录消耗的时间
        // timeCost = Date.now()-lastTime;
        // lastTime = Date.now();

        this.reRender()
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
        this.dragging = false;        //hold一个物体
        this.scratching = false;     //抓住背景，可拖动内容整体滚动
        this.selectObjId = 0;
        this.contentW = contentW;    //内容宽度
        this.contentH = contentH;    //内容高度
        this.drawScrollBar = drawScrollBar;
        this.backgroundImg = {};

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

        //time function
        this._springTimeFun = Utils.calTimingFunctionBySpring(12,180,0);

        //animation
        this._animation = null;     //动画
        this._contentVelcoity = {   //内容滚动的速度
            y:0,
            x:0
        };
        this._amplitude = {         //速度的幅度
            y:0,
            x:0
        };
        this._frame = {             //保存旧的鼠标坐标
            x:0,
            y:0,
        };
        this._targetPos = {          //内容滑动后的目标位置
            x:0,
            y:0
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
        this.backgroundImg.content?this.drawBackground():'';
        this.ctx.setTransform(1,0,0,1,this.contentOffset.x,this.contentOffset.y);
        var objs = this.objs||[];
        for(var i=0,il=objs.length;i<il;i++){
            switch(objs[i].type){
                case 'ball':
                    this.drawBall(objs[i])
                    break;
                case 'rect':
                    this.drawRect(objs[i]);
                    break;
                case 'image':
                    this.drawImage(objs[i])
                    break;
                default:
                    console.log('miss in reRender')
                    break;
            }
        }
        this.drawScrollBar?this._drawProgress():'';
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
    _drawProgress:function(){
        this.ctx.setTransform(1,0,0,1,0,0);
        var top,left,width,height,springOffsetY;
        springOffsetY = (this.springOffset.y>0)?-this.springOffset.y:(-2*this.springOffset.y);
        width = 4;
        height  = Math.round((this.height*this.height)/this.contentH)-Math.abs(this.springOffset.y);
        height = (height<10)?10:height
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

export default SXRender;
