(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.SXRender = factory());
}(this, (function () { 'use strict';

/**
 * Created by lixiang on 2018/1/7.
 */

/**
 * 获取元素内相对坐标
 * @param  {[type]} e [description]
 */
var getRelativeRect = function getRelativeRect(e) {
    var x, y, DomRect;

    x = e.clientX;
    y = e.clientY;

    DomRect = e.target.getBoundingClientRect();

    return {
        x: Math.round(x - DomRect.x),
        y: Math.round(y - DomRect.y)
    };
};

/**
 * 检查点击区域是否有对象,返回对象ID。如果点击空白区域，认为在扒页面
 * @param  {[type]} objs     [description]
 * @param  {[type]} clickPos [description]
 */
var checkClickElm = function checkClickElm(objs, clickPos, contentOffset) {
    var obj = null;
    var pos = clickPos;
    for (var i = 0, il = objs.length; i < il; i++) {
        obj = objs[i];
        if (obj.draggable !== true) {
            continue;
        }
        switch (obj.type) {
            case 'ball':
                if (pos.x > obj.x + contentOffset.x - obj.radius && pos.x < obj.x + contentOffset.x + obj.radius && pos.y > obj.y + contentOffset.y - obj.radius && pos.y < obj.y + contentOffset.y + obj.radius) {
                    return obj.id;
                }
                break;
            case 'rect':
                if (pos.x > obj.x + contentOffset.x && pos.x < obj.x + contentOffset.x + obj.w && pos.y > obj.y + contentOffset.y && pos.y < obj.y + contentOffset.y + obj.h) {
                    return obj.id;
                }
                break;
            case 'image':
                return obj.id;
                break;
            default:
                //click in background
                return 0;
                break;
        }
    }
};

/**
 * 橡皮擦公式
 * @param  {num} x 鼠标移动的距离
 * @param  {num} c 阻尼常量
 * @param  {num} d 容器尺寸
 * @return {num}   实际移动距离
 */
var rubberBanding = function rubberBanding(x, d) {
    var c = 0.55;
    if (x > 0) {
        return Math.round((1 - 1 / (x * c / d + 1)) * d);
    } else {
        return -Math.round((1 - 1 / (-x * c / d + 1)) * d);
    }
};

/**
 * 根据阻尼系数，弹力系数，初始速度，初始位置信息，计算出进度p关于时间t的函数
 * @param  {num} damping         阻尼系数
 * @param  {num} stiffness       弹力系数
 * @param  {num} initialVelocity 初始速度
 * @param  {num} startX          初始位置
 * @return {fun}                 p关于t的函数
 */
var calTimingFunctionBySpring = function calTimingFunctionBySpring(damping, stiffness, initialVelocity, startX) {
    var c = damping;
    var k = stiffness;
    var v = initialVelocity;
    var t = c * c - 4 * k;
    var r1, r2;
    var alpha, beta;
    var f0;
    var fp0;
    f0 = (startX || 0) - 1;
    fp0 = v;
    var C1, C2;
    if (t > 0) {
        t = Math.sqrt(t);
        r1 = (-c + t) * 0.5;
        r2 = (-c - t) * 0.5;

        C1 = (fp0 - r2 * f0) / (r1 - r2);
        C2 = (fp0 - r1 * f0) / (r2 - r1);
        return function (t) {
            return C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t) + 1;
        };
    } else if (t == 0) {
        r1 = -c * 0.5;
        C1 = f0;
        C2 = fp0 - C1 * r1;
        return function (t) {
            return (C1 + C2 * t) * Math.exp(r1 * t) + 1;
        };
    } else {
        t = Math.sqrt(-t);
        alpha = -c * 0.5;
        beta = t * 0.5;

        C1 = f0;
        C2 = (fp0 - alpha * f0) / beta;
        return function (t) {
            return (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t)) * Math.exp(alpha * t) + 1;
        };
    }
};

var genGUID = function genGUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    }).toUpperCase();
};

/**
 * Created by lixiang on 2018/1/8.
 */

// export default (
//     typeof window !== 'undefined'
//     && (
//         (window.requestAnimationFrame && window.requestAnimationFrame.bind(window))
//         // https://github.com/ecomfe/zrender/issues/189#issuecomment-224919809
//         || (window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window))
//         || window.mozRequestAnimationFrame
//         || window.webkitRequestAnimationFrame
//     )
// ) || function (func,interval) {
//     setTimeout(func, interval);
// };


function requestAnimationFrame$1 (func, interval) {
  setTimeout(func, interval);
}

/**
 * 时间曲线
 * @type {{linear: timingFunctions.linear, easeInQuad: timingFunctions.easeInQuad, easeOutQuad: timingFunctions.easeOutQuad, easeInOutQuad: timingFunctions.easeInOutQuad, easeInCubic: timingFunctions.easeInCubic, easeOutCubic: timingFunctions.easeOutCubic, easeInOutCubic: timingFunctions.easeInOutCubic, easeInQuart: timingFunctions.easeInQuart, easeOutQuart: timingFunctions.easeOutQuart, easeInOutQuart: timingFunctions.easeInOutQuart, easeInQuint: timingFunctions.easeInQuint, easeOutQuint: timingFunctions.easeOutQuint, easeInOutQuint: timingFunctions.easeInOutQuint, spring: timingFunctions.spring}}
 */
var timingFunctions = {
    // no easing, no acceleration
    linear: function linear(t) {
        return t;
    },
    // accelerating from zero velocity
    easeInQuad: function easeInQuad(t) {
        return t * t;
    },
    // decelerating to zero velocity
    easeOutQuad: function easeOutQuad(t) {
        return t * (2 - t);
    },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function easeInOutQuad(t) {
        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    // accelerating from zero velocity
    easeInCubic: function easeInCubic(t) {
        return t * t * t;
    },
    // decelerating to zero velocity
    easeOutCubic: function easeOutCubic(t) {
        return --t * t * t + 1;
    },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function easeInOutCubic(t) {
        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    // accelerating from zero velocity
    easeInQuart: function easeInQuart(t) {
        return t * t * t * t;
    },
    // decelerating to zero velocity
    easeOutQuart: function easeOutQuart(t) {
        return 1 - --t * t * t * t;
    },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function easeInOutQuart(t) {
        return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    },
    // accelerating from zero velocity
    easeInQuint: function easeInQuint(t) {
        return t * t * t * t * t;
    },
    // decelerating to zero velocity
    easeOutQuint: function easeOutQuint(t) {
        return 1 + --t * t * t * t * t;
    },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function easeInOutQuint(t) {
        return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    },
    //spring
    spring: function spring(t) {
        return -0.5 * Math.exp(-6 * t) * (-2 * Math.exp(6 * t) + Math.sin(12 * t) + 2 * Math.cos(12 * t));
    }
};

//状态表
var stateTypes = {
    idle: 'idle',
    running: 'running',
    paused: 'paused'
};

//状态构造器
function State(stateType, repeat, curFrame, curValue) {
    this.stateType = stateType || stateTypes.idle;
    this.repeat = repeat || 0;
    this.curFrame = curFrame || 0;
    this.curValue = curValue;
}

/**
 * Created by lixiang on 2018/1/8.
 */

//插值
function interpolateValue(startValue, stopValue, progress) {
    return Math.round(startValue + progress * (stopValue - startValue));
}

var Animation = function Animation(target, key, startValue, stopValue, duration, opts) {
    opts = opts || {};

    this.target = target;
    this.key = key;
    this.startValue = startValue;
    this.stopValue = stopValue;
    this.duration = duration;

    this.fps = opts.fps || 60;
    this.startDelay = opts.startDelay || 0;
    this.autoReverse = opts.autoReverse || false;
    this.repeatCount = opts.repeatCount || 1;
    this.appliedOnCompletion = opts.appliedOnCompletion || function () {};
    this.timingFun = opts.timingFun || timingFunctions.linear; //必须是个函数

    this.state = new State();
    this.lastState = null;

    //event
    this.didStartCB = opts.didStartCB || function () {};
    this.onFrameCB = opts.onFrameCB || function () {};
    this.didPauseCB = opts.didPauseCB || function () {};
    this.didStopCB = opts.didStopCB || function () {};

    //private
    this._p = 0; //进度
    this._totalFrames = 0; //总帧数
    this._timeStep = 0; //定时器间隔
    this._timeStamp = 0; //开始动画时间戳
    this.init();
};

var coreStartHandler = function coreStartHandler() {
    if (this.state.stateType !== stateTypes.running) {
        return;
    }

    this._p = this.timingFun(this.state.curFrame / this._totalFrames);
    this.state.curValue = interpolateValue(this.startValue, this.stopValue, this._p);

    if (this.target.hasOwnProperty(this.key)) {
        this.target[this.key] = this.state.curValue;
    }

    this.onFrameCB && this.onFrameCB();
    if (this.state.curFrame < this._totalFrames) {
        requestAnimationFrame$1(coreStartHandler.bind(this), this._timeStep);
    } else {
        this.stop();
    }

    this.state.curFrame++;
    this.onFrameCB && this.onFrameCB();
};

Animation.prototype = {
    constructor: Animation,
    init: function init() {
        //计算总帧数
        this._totalFrames = this.duration / 1000 * this.fps;
        //计算定时器间隔
        this._timeStep = Math.round(1 / this.fps);
    },
    start: function start() {
        if (this.state.stateType !== stateTypes.idle) {
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function () {
            this.didStartCB && this.didStartCB();
            requestAnimationFrame$1(coreStartHandler.bind(this), this._timeStep);
        }.bind(this), this.startDelay);
    },
    stop: function stop() {
        this.state.stateType = stateTypes.idle;
        this.state.curValue = 0;
        this.state.curFrame = 0;
        this._totalFrames = 0;
    }
};

//惯性滚动动画
var InertialAnimation = function InertialAnimation(target, key, startValue, stopValue, amplitude, opts) {
    Animation.apply(this, [target, key, startValue, stopValue, null, opts]);

    this._amplitude = amplitude;
    this.init();
};

var inertialStartHandler = function inertialStartHandler() {
    var elapsed = Date.now() - this._timeStamp;
    var state = this.state;

    if (this.state.stateType !== stateTypes.running) {
        return;
    }

    state.curValue = calInertialValue(this.stopValue, this._amplitude, elapsed);
    if (Math.abs(this.stopValue - state.curValue) < 1) {
        state.curValue = this.stopValue;
        this.onFrameCB && this.onFrameCB();
        this.stop();
    } else {
        this.onFrameCB && this.onFrameCB();
        requestAnimationFrame(inertialStartHandler.bind(this), this._timeStep);
    }
};

/**
 * y`目标位置，A当前振幅(速度),c时间常量
 * y(t)=y`-A*e^(-t/c)
 * timeConstant = 500; //时间常量，用于惯性滚动的计算中,IOS中为325
 * 返回值为y(t)
 */

var calInertialValue = function calInertialValue(target, amplitude, elapsed) {
    var timeConstant = 500;

    return target - amplitude * Math.exp(-elapsed / timeConstant);
};

//继承Animation
InertialAnimation.prototype = Object.create(Animation.prototype);
Object.assign(InertialAnimation.prototype, {
    constructor: InertialAnimation,
    init: function init() {
        this._timeStep = 1 / this.fps;
    },
    start: function start() {
        if (this.state.stateType !== stateTypes.idle) {
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function () {
            this.didStartCB && this.didStartCB();
            this._timeStamp = Date.now();
            requestAnimationFrame(inertialStartHandler.bind(this), this._timeStep);
        }.bind(this), this.startDelay);
    }
});

/**
 * Created by lixiang on 2018/1/7.
 */

/**
 * 鼠标按下事件。
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseDownHandler(e) {
    var pos = getRelativeRect(e);

    this.selectObjId = checkClickElm(this.objs, pos, this.contentOffset);
    this.mouseDownPos = pos;
    if (!!this.selectObjId) {
        //选中物体
        this.dragging = true;
    } else {
        //拖动界面
        this.scratching = true;

        this._animation ? this._animation.stop() : null;
        clearInterval(this._animation); //清除动画
        clearInterval(this._ticker);

        this._contentVelcoity.y = 0;
        this._contentVelcoity.x = 0;
        this._amplitude.y = 0;
        this._amplitude.x = 0;

        //跟踪鼠标，获取速度，50ms获取一次
        this._timeStamp = Date.now();
        this._frame.y = pos.y;
        this._ticker = setInterval(function () {
            var now, elapsed, delta, v;
            now = Date.now();
            elapsed = now - this._timeStamp;
            this._timeStamp = now;
            delta = this.mouseDownPos.y - this._frame.y;
            this._frame.y = this.mouseDownPos.y;
            v = 1000 * delta / (1 + elapsed);
            this._contentVelcoity.y = 0.8 * v + 0.2 * this._contentVelcoity.y;
        }.bind(this), 50);
    }
}

/**
 * 鼠标抬起事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseUpHandler(e) {
    if (this.dragging) {

        this.dragging = false;
        this.selectObjId = 0;
    } else if (this.scratching) {

        //扒页面
        this.scratching = false;

        //清空速度计算的轮训
        clearInterval(this._ticker);

        var timeTick = 0,
            timeStep = 16,
            p = 0,
            limitOffsetY = 0.0001;

        if (this.springOffset.y !== 0) {

            //执行spring动画
            clearInterval(this._animation); //清除正在进行的其他动画
            this._animation = setInterval(function () {
                if (Math.abs(this.springOffset.y) > limitOffsetY) {
                    p = this._springTimeFun(timeTick / 1000);
                    timeTick += timeStep;

                    this.springOffset.y = (1 - p) * this.springOffset.y;
                    // console.log('springOffset.y',this.springOffset.y)
                    this.reRender();
                } else {
                    this.springOffset.y = 0;
                    this.reRender();
                    //清除引用
                    clearInterval(this._animation);
                    this._animation = null;
                    timeTick = null;
                    p = null;
                }
            }.bind(this), timeStep);
        } else {
            //开始惯性滚动
            var amplitude;
            if (this._contentVelcoity.y > 30 || this._contentVelcoity.y < -30) {
                amplitude = 0.8 * this._contentVelcoity.y;
                // this._timeStamp = Date.now();
                this._targetPos.y = Math.round(this.contentOffset.y + amplitude);

                //开启动画
                var self = this;
                this._animation = new InertialAnimation(null, '', this.contentOffset.y, this._targetPos.y, amplitude);
                this._animation.onFrameCB = function () {
                    //检查是否越界
                    if (self.contentOffset.y > 0) {
                        self.contentOffset.y = 0;
                        self._animation.stop();
                    } else if (self.contentOffset.y < self.height - self.contentH) {
                        self.contentOffset.y = self.height - self.contentH;
                        self._animation.stop();
                    } else {
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
function mouseMoveHandler(e) {
    var dragging,
        selectObjId,
        selectObj,
        pos,
        //鼠标点击在canvas内的位置
    diff = { x: 0, y: 0 }; //鼠标位置间的差值

    pos = getRelativeRect(e);

    if (this.dragging) {
        //选中物体
        diff.x = pos.x - this.mouseDownPos.x;
        diff.y = pos.y - this.mouseDownPos.y;
        this.mouseDownPos.x = pos.x;
        this.mouseDownPos.y = pos.y;
        selectObj = this.findObjById(this.selectObjId);
        selectObj.x += diff.x;
        selectObj.y += diff.y;
        this.reRender();
    } else if (this.scratching) {
        //扒动页面
        // console.log('event',e.offsetY);

        diff.x = pos.x - this.mouseDownPos.x;
        diff.y = pos.y - this.mouseDownPos.y;

        if (diff.y < 0) {
            //内容向上
            if (this.contentOffset.y <= this.height - this.contentH) {
                this.contentOffset.y = Math.floor(this.height - this.contentH);
                //到达下边缘
                this.springOffset.y = rubberBanding(diff.y, this.height);
            } else {
                this.mouseDownPos.x = pos.x;
                this.mouseDownPos.y = pos.y;
                this.contentOffset.y += diff.y;
            }
        } else {
            //内容向下
            if (this.contentOffset.y >= 0) {
                //到达上边缘
                this.contentOffset.y = 0;
                this.springOffset.y = rubberBanding(diff.y, this.height);
            } else {
                this.mouseDownPos.x = pos.x;
                this.mouseDownPos.y = pos.y;
                this.contentOffset.y += diff.y;
            }
        }

        //记录消耗的时间
        // timeCost = Date.now()-lastTime;
        // lastTime = Date.now();

        this.reRender();
    }
}

var SXRender = function SXRender(opts) {
    var canvas, ctx, opts, id, w, h, bgColor, contentW, contentH, drawScrollBar;
    opts = opts || {};

    id = opts.id || '';
    w = opts.w;
    h = opts.h;
    bgColor = opts.backgroundColor || '';
    contentW = opts.contentW || w;
    contentH = opts.contentH || h;
    drawScrollBar = opts.drawScrollBar || false;

    canvas = !!id ? document.getElementById(id) : document.createElement("canvas");
    canvas.style.backgroundColor = !!bgColor ? bgColor : 'rgba(0,0,0,0)';
    canvas.width = w || 500;
    canvas.height = h || 500;

    ctx = canvas.getContext("2d");

    this.init(canvas, ctx, contentW, contentH, drawScrollBar);
};

SXRender.prototype = {
    constructor: SXRender,
    init: function init(canvas, ctx, contentW, contentH, drawScrollBar) {
        //canvas
        this.canvas = canvas;
        this.ctx = ctx;

        //basic attrs
        this.width = canvas.width;
        this.height = canvas.height;
        this.dragging = false; //hold一个物体
        this.scratching = false; //抓住背景，可拖动内容整体滚动
        this.selectObjId = 0;
        this.contentW = contentW; //内容宽度
        this.contentH = contentH; //内容高度
        this.drawScrollBar = drawScrollBar;
        this.backgroundImg = {};

        this.mouseDownPos = {
            x: 0,
            y: 0
        };
        this.springOffset = {
            x: 0, //X方向偏移，用于橡皮擦扒的效果。
            y: 0 //Y方向偏移，用于橡皮擦扒的效果。
        };
        this.contentOffset = {
            x: 0,
            y: 0 //内容的偏移
        };

        //objs list
        this.objs = [];

        //time function
        this._springTimeFun = calTimingFunctionBySpring(12, 180, 0);

        //animation
        this._animation = null; //动画
        this._contentVelcoity = { //内容滚动的速度
            y: 0,
            x: 0
        };
        this._amplitude = { //速度的幅度
            y: 0,
            x: 0
        };
        this._frame = { //保存旧的鼠标坐标
            x: 0,
            y: 0
        };
        this._targetPos = { //内容滑动后的目标位置
            x: 0,
            y: 0
        };
        this._ticker = null; //内部定时器,用于捕获速度
        this._timeStamp = 0; //保存上次move的时刻的时间戳


        //events
        this.canvas.addEventListener('mousedown', mouseDownHandler.bind(this), false);
        this.canvas.addEventListener('mouseup', mouseUpHandler.bind(this), false);
        this.canvas.addEventListener('mousemove', mouseMoveHandler.bind(this), false);
        this.canvas.addEventListener('mouseout', mouseUpHandler.bind(this), false);
    },
    //绘制画板背景
    drawBackground: function drawBackground(opts) {
        if (!!opts) {
            this.backgroundImg.content = opts.imgObj;
            this.backgroundImg.sx = opts.sx || 0;
            this.backgroundImg.sy = opts.sy || 0;
            this.backgroundImg.sw = opts.sw || 0;
            this.backgroundImg.sh = opts.sh || 0;
            this.backgroundImg.dx = opts.dx || 0;
            this.backgroundImg.dy = opts.dy || 0;
            this.backgroundImg.dw = opts.dw || this.width;
            this.backgroundImg.dh = opts.dh || this.height;
        }

        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (!this.backgroundImg.content) {
            return;
        }
        if (this.backgroundImg.sw && this.backgroundImg.sh) {
            this.ctx.drawImage(this.backgroundImg.content, this.backgroundImg.sx, this.backgroundImg.sy, this.backgroundImg.sw, this.backgroundImg.sh, this.backgroundImg.dx, this.backgroundImg.dy, this.backgroundImg.dw, this.backgroundImg.dh);
        } else {
            this.ctx.drawImage(this.backgroundImg.content, this.backgroundImg.dx, this.backgroundImg.dy, this.backgroundImg.dw, this.backgroundImg.dh);
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
    drawBall: function drawBall(opts) {
        var x, y, radius, color;
        var opts = opts || {};
        var startAngle = Math.PI * 0;
        var endAngle = Math.PI * 2;
        var anticlockwise = false;

        x = opts.x + this.springOffset.x;
        y = opts.y + this.springOffset.y;
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
    clearCtx: function clearCtx(opts) {
        var x, y, w, h;
        var opts = opts || {};
        x = opts.x || 0;
        y = opts.y || 0;
        w = opts.w || this.width;
        h = opts.h || this.height;
        this.ctx.clearRect(x, y, w, h);
    },
    /**
     * 画一个矩形
     */
    drawRect: function drawRect(opts) {
        var x, y, w, h, color;
        var opts = opts || {};
        x = opts.x + this.springOffset.x;
        y = opts.y + this.springOffset.y;
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
    drawImage: function drawImage(opts) {
        var imgObj, x, y, w, h, dx, dy, dw, dh;
        var opts = opts || {};
        imgObj = opts.imgObj;
        x = opts.x || 0;
        y = opts.y || 0;
        w = opts.w;
        h = opts.h;
        dx = opts.dx || 0;
        dy = opts.dy || 0;
        dw = opts.dw || 0;
        dh = opts.dh || 0;
        this.ctx.save();
        if (dw && dh) {
            this.ctx.drawImage(imgObj, x, y, w, h, dx, dy, dw, dh);
        } else if (w && h) {
            x += this.springOffset.x;
            y += this.springOffset.y;
            this.ctx.drawImage(imgObj, x, y, w, h);
        } else {
            this.ctx.drawImage(imgObj, x, y);
        }
        this.ctx.restore();
    },
    /**
     * 重新绘制
     * @return {[type]} [description]
     */
    reRender: function reRender() {
        this.clearCtx();
        this.backgroundImg.content ? this.drawBackground() : '';
        this.ctx.setTransform(1, 0, 0, 1, this.contentOffset.x, this.contentOffset.y);
        var objs = this.objs || [];
        for (var i = 0, il = objs.length; i < il; i++) {
            switch (objs[i].type) {
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
        this.drawScrollBar ? this._drawProgress() : '';
    },
    findObjById: function findObjById(id) {
        for (var i = 0, il = this.objs.length; i < il; i++) {
            if (this.objs[i].id === id) {
                return this.objs[i];
            }
        }
        return null;
    },
    add: function add(obj) {
        var o = {};
        o = Object.assign(o, obj, {
            id: genGUID()
        });
        this.objs.push(o);
    },
    _drawProgress: function _drawProgress() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        var top, left, width, height, springOffsetY;
        springOffsetY = this.springOffset.y > 0 ? -this.springOffset.y : -2 * this.springOffset.y;
        width = 4;
        height = Math.round(this.height * this.height / this.contentH) - Math.abs(this.springOffset.y);
        height = height < 10 ? 10 : height;
        top = Math.round(-this.contentOffset.y * this.height / this.contentH) + springOffsetY;
        left = this.width - width;

        this.drawRect({
            x: left,
            y: top,
            w: width,
            h: height,
            color: '#888888'
        });
    }
};

return SXRender;

})));
