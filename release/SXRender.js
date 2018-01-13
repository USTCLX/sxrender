(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.SXRender = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

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
 * 生成uuid
 * @returns {string}
 */
var genGUID = function genGUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    }).toUpperCase();
};

/**
 * 深拷贝
 */
var deepClone = function deepClone(values) {
    var copy;
    if (null === values || "object" !== (typeof values === 'undefined' ? 'undefined' : _typeof(values))) {
        return values;
    }

    if (values instanceof Date) {
        copy = new Date();
        copy.setTime(values.getTime());
        return copy;
    }

    if (values instanceof Array) {
        copy = [];
        for (var i = 0, len = values.length; i < len; i++) {
            copy[i] = deepClone(values[i]);
        }
        return copy;
    }

    if (values instanceof Object) {
        copy = {};
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                copy[key] = deepClone(values[key]);
            }
        }
        return copy;
    }
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


function requestAnimationFrame (func, interval) {
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

var valueTypes = {
    number: 'number',
    string: 'string',
    object: 'object'
};

//状态构造器
function State(stateType, repeat, curFrame, curValue) {
    this.stateType = stateType || stateTypes.idle;
    this.repeat = repeat || 0;
    this.curFrame = curFrame || 0;
    this.curValue = curValue;
}

//插值
function interpolateNumber(startValue, stopValue, progress) {
    return Math.round(startValue + progress * (stopValue - startValue));
}

//对象插值
function interpolateObject(startObj, stopObj, progress) {
    var obj = Object.assign({}, startObj);
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            obj[key] = Math.round(startObj[key] + progress * (stopObj[key] - startObj[key]));
        }
    }
    return obj;
}

/**
 * Created by lixiang on 2018/1/8.
 */

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
    this._timeStamp = 0; //开始动画事件戳
    this._lastTimeStamp = 0; //动画帧时间戳
    this._valueType = valueTypes.number;

    this.init();
};

var coreAnimateHandler = function coreAnimateHandler() {
    if (this.state.stateType !== stateTypes.running) {
        return;
    }

    this._p = this.timingFun(this.state.curFrame / this._totalFrames);

    this.state.curValue = this._valueType !== valueTypes.object ? interpolateNumber(this.startValue, this.stopValue, this._p) : interpolateObject(this.startValue, this.stopValue, this._p);

    if (this.target.hasOwnProperty(this.key)) {
        this.target[this.key] = this.state.curValue;
    }

    this.onFrameCB && this.onFrameCB();

    this.lastState = deepClone(this.state);
    this._lastTimeStamp = Date.now();

    if (this.state.curFrame < this._totalFrames) {
        requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
    } else {
        this.state.curValue = this.stopValue;
        this.didStopCB && this.didStopCB();
        this.stop();
    }

    this.state.curFrame++;
};

Animation.prototype = {
    constructor: Animation,
    init: function init() {
        //计算总帧数
        this._totalFrames = this.duration / 1000 * this.fps;
        //计算定时器间隔
        this._timeStep = Math.round(1 / this.fps);
        //判断valueType
        switch (_typeof(this.startValue)) {
            case 'object':
                this._valueType = valueTypes.object;
                break;
            case 'number':
                this._valueType = valueTypes.number;
                break;
            default:
                break;
        }
        //state curValue
        this.state.curValue = deepClone(this.startValue);
    },
    start: function start() {
        if (this.state.stateType !== stateTypes.idle) {
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function () {
            this.didStartCB && this.didStartCB();
            this._lastTimeStamp = Date.now();
            this.lastState = deepClone(this.state);
            requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
        }.bind(this), this.startDelay);
    },
    stop: function stop() {
        this.state.stateType = stateTypes.idle;
        this.state.curValue = 0;
        this.state.curFrame = 0;
        this._totalFrames = 0;
        this.didStopCB && this.didStopCB();
    },
    pause: function pause() {
        if (this.state.stateType === stateTypes.running) {
            this.state.stateType = stateTypes.paused;
            this.didPauseCB && this.didPauseCB();
        }
    },
    resume: function resume() {
        if (this.state.stateType === stateTypes.paused) {
            this.state.stateTypes = stateTypes.running;
            requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
        }
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

/**
 * initialVelocity 初始速度
 * damping 阻尼系数,一般为12
 * stiffness 弹力系数,一般为180
 * duration 弹跳动画持续时间，一般为2000ms
 */
var SpringAnimation = function SpringAnimation(target, key, initialVelocity, damping, stiffness, startValue, stopValue, duration, startX) {
    Animation.apply(this, [target, key, startValue, stopValue, duration]);
    this.initialVelocity = initialVelocity || 0;
    this.damping = damping || 12;
    this.stiffness = stiffness || 180;
    this.startX = startX || 0;
};
//继承Animation
SpringAnimation.prototype = Object.create(Animation.prototype);

var springAnimateHandler = function springAnimateHandler() {
    if (this.state.stateType !== stateTypes.running) {
        return;
    }
    this._p = this.timingFun(this.state.curFrame / this._totalFrames);

    if (this.startX === 0) {
        this.state.curValue = this._valueType !== valueTypes.object ? interpolateNumber(this.startValue, this.stopValue, this._p) : interpolateObject(this.startValue, this.stopValue, this._p);
    } else if (this.startX === 1) {
        //在平衡位置，以一个初速度开始弹跳
        this.state.curValue = this._p - 1;
    }

    if (this.target && this.target.hasOwnProperty(this.key)) {
        this.target[this.key] = this.state.curValue;
    }

    this.onFrameCB && this.onFrameCB();
    if (this.state.curFrame < this._totalFrames) {
        requestAnimationFrame(springAnimateHandler.bind(this), this._timeStep);
    } else {
        this.state.curValue = this.stopValue;
        this.didStopCB && this.didStopCB();
        this.stop();
    }
    this.state.curFrame++;
};

Object.assign(SpringAnimation.prototype, {
    constructor: SpringAnimation,
    start: function start() {
        if (this.state.stateType !== stateTypes.idle) {
            return;
        }
        this.state.stateType = stateTypes.running;
        this.timingFun = calTimingFunctionBySpring(this.damping, this.stiffness, this.initialVelocity, this.startX);
        setTimeout(function () {
            this.didStartCB && this.didStartCB();
            this._timeStamp = Date.now();
            requestAnimationFrame(springAnimateHandler.bind(this), this._timeStep);
        }.bind(this), this.startDelay);
    }
});

//惯性滚动动画
var InertialAnimation = function InertialAnimation(target, key, startValue, stopValue, amplitude, opts) {
    Animation.apply(this, [target, key, startValue, stopValue, null, opts]);

    this.amplitude = amplitude;
    this.init();
};

var inertialAnimateHandler = function inertialAnimateHandler() {
    var elapsed = Date.now() - this._timeStamp;
    var state = this.state;

    if (this.state.stateType !== stateTypes.running) {
        return;
    }

    state.curValue = calInertialValue(this.stopValue, this.amplitude, elapsed, this._valueType);
    if (this._valueType === valueTypes.object) {
        var len = 0;
        var i = 0;
        for (var key in state.curValue) {
            if (state.curValue.hasOwnProperty(key)) {
                len++;
                if (Math.abs(this.stopValue[key] - state.curValue[key]) < 1) {
                    i++;
                    state.curValue[key] = this.stopValue[key];
                }
            }
        }
        if (i === len) {
            //所有属性都已达到临界值
            this.onFrameCB && this.onFrameCB();
            this.stop();
            return;
        }
    } else if (this._valueType === valueTypes.number) {
        if (Math.abs(this.stopValue - state.curValue) < 1) {
            state.curValue = this.stopValue;
            this.onFrameCB && this.onFrameCB();
            this.stop();
            return;
        }
    }

    this.onFrameCB && this.onFrameCB();

    this._lastTimeStamp = Date.now();
    this.lastState = deepClone(this.state);
    requestAnimationFrame(inertialAnimateHandler.bind(this), this._timeStep);
};

/**
 * y`目标位置，A当前振幅(速度),c时间常量
 * y(t)=y`-A*e^(-t/c)
 * timeConstant = 500; //时间常量，用于惯性滚动的计算中,IOS中为325
 * 返回值为y(t)
 */

var calInertialValue = function calInertialValue(target, amplitude, elapsed, valueType) {
    var timeConstant = 500;

    if (valueType === valueTypes.object) {
        var obj = {};
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                obj[key] = target[key] - amplitude[key] * Math.exp(-elapsed / timeConstant);
            }
        }
        return obj;
    } else {
        return target - amplitude * Math.exp(-elapsed / timeConstant);
    }
};

//继承Animation
InertialAnimation.prototype = Object.create(Animation.prototype);
Object.assign(InertialAnimation.prototype, {
    constructor: InertialAnimation,
    start: function start() {
        if (this.state.stateType !== stateTypes.idle) {
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function () {
            this.didStartCB && this.didStartCB();
            this._timeStamp = Date.now();
            this._lastTimeStamp = Date.now();
            this.lastState = deepClone(this.state);
            requestAnimationFrame(inertialAnimateHandler.bind(this), this._timeStep);
        }.bind(this), this.startDelay);
    }
});

/**
 * Created by lixiang on 2018/1/7.
 */

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
        this.dragging = false; //drag一个物体
        this.scratching = false; //抓住背景，可拖动内容整体滚动
        this.selectObjId = 0;
        this.contentW = contentW; //内容宽度
        this.contentH = contentH; //内容高度
        this.drawScrollBar = drawScrollBar;
        this.backgroundImg = {};
        this.scrollVEnabled = !!(this.contentH && this.contentH > this.height);
        this.scrollHEnabled = !!(this.contentW && this.contentW > this.width);
        this.limitX = {
            min: this.width - this.contentW,
            max: 0
        };
        this.limitY = {
            min: this.height - this.contentH,
            max: 0
        };

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

        //animation
        this._animation = null; //动画
        this._contentVelcoity = { //内容滚动的速度
            y: 0,
            x: 0
        };
        this._frame = { //保存旧的鼠标坐标,用于获取速度
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
        this.backgroundImg.content ? this.drawBackground() : null;
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
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.scrollHEnabled || this.scrollVEnabled && this.drawScrollBar) {
            this._drawProgress();
        }
    },
    /**
     * 寻找物体
     * @param id
     * @returns {*}
     */
    findObjById: function findObjById(id) {
        for (var i = 0, il = this.objs.length; i < il; i++) {
            if (this.objs[i].id === id) {
                return this.objs[i];
            }
        }
        return null;
    },
    /**
     * 增加物体
     * @param obj
     */
    add: function add(obj) {
        var o = {};
        o = Object.assign(o, obj, {
            id: genGUID()
        });
        this.objs.push(o);
    },
    /**
     * 绘制进度条
     * @private
     */
    _drawProgress: function _drawProgress() {
        var top, left, width, height;

        if (this.scrollVEnabled) {
            width = 4;
            height = Math.round(this.height * this.height / this.contentH) - Math.abs(this.springOffset.y);
            height = height < 10 ? 10 : height;
            top = Math.round(-this.contentOffset.y * this.height / this.contentH);
            left = this.width - width;

            this.ctx.save();
            this.ctx.fillStyle = '#888888';
            this.ctx.fillRect(left, top, width, height);
            this.ctx.restore();
        }

        if (this.scrollHEnabled) {
            width = Math.round(this.width * this.width / this.contentW) - Math.abs(this.springOffset.x);
            width = width < 10 ? 10 : width;
            height = 4;

            top = this.height - height;
            left = Math.round(-this.contentOffset.x * this.width / this.contentW) - this.springOffset.x;
            this.ctx.save();
            this.ctx.fillStyle = '#888888';
            this.ctx.fillRect(left, top, width, height);
            this.ctx.restore();
        }
    }
};

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
        // clearInterval(this._animation); //清除动画
        clearInterval(this._ticker);

        this._contentVelcoity.y = 0;
        this._contentVelcoity.x = 0;

        //跟踪鼠标，获取速度，50ms获取一次
        if (this.scrollVEnabled || this.scrollHEnabled) {
            this._timeStamp = Date.now();
            this._frame.y = this.mouseDownPos.y;
            this._frame.x = this.mouseDownPos.x;
            this._ticker = setInterval(function () {
                var now, elapsed, delta, v;
                now = Date.now();
                elapsed = now - this._timeStamp;
                this._timeStamp = now;
                delta = this.mouseDownPos.y - this._frame.y;
                v = 1000 * delta / (1 + elapsed);
                this._contentVelcoity.y = 0.8 * v + 0.2 * this._contentVelcoity.y;
                delta = this.mouseDownPos.x - this._frame.x;
                v = 1000 * delta / (1 + elapsed);
                this._contentVelcoity.x = 0.8 * v + 0.2 * this._contentVelcoity.x;
                this._frame.y = this.mouseDownPos.y;
                this._frame.x = this.mouseDownPos.x;
            }.bind(this), 50);
        }
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

        if (this.scrollVEnabled || this.scrollHEnabled) {
            if (this.springOffset.y !== 0 || this.springOffset.x !== 0) {
                //开启弹跳动画
                var self = this;
                this._animation = new SpringAnimation(null, '', 0, 12, 180, this.springOffset, { x: 0, y: 0 }, 2000);
                this._animation.onFrameCB = function () {
                    self.springOffset = this.state.curValue;
                    self.reRender();
                };
                this._animation.start();
            } else {
                //开始惯性滚动
                var amplitude = {},
                    targetPos = {},
                    v = this._contentVelcoity;
                if (v.y > 30 || v.y < -30 || v.x > 30 || v.x < -30) {
                    amplitude.x = v.x < -30 || v.x > 30 ? 0.8 * v.x : 0;
                    amplitude.y = v.y < -30 || v.y > 30 ? 0.8 * v.y : 0;
                    targetPos.x = Math.round(this.contentOffset.x + amplitude.x);
                    targetPos.y = Math.round(this.contentOffset.y + amplitude.y);
                    //开启惯性滚动动画
                    var self = this;
                    this._animation = new InertialAnimation(null, '', this.contentOffset, targetPos, amplitude);
                    this._animation.onFrameCB = function () {
                        //检查是否越界
                        var c,
                            vx = 0,
                            vy = 0; //碰撞到边缘时，x，y方向上的即时速度
                        self.contentOffset = this.state.curValue;
                        c = self.contentOffset;
                        if (c.x > self.limitX.max || c.x < self.limitX.min) {
                            c.x = c.x > self.limitX.max ? self.limitX.max : self.limitX.min;
                            vx = (this.state.curValue.x - this.lastState.curValue.x) / (Date.now() - this._lastTimeStamp) * 1000;
                            // this.stop();
                        }
                        if (c.y > self.limitY.max || c.y < self.limitY.min) {
                            c.y = c.y > self.limitY.max ? self.limitY.max : self.limitY.min;
                            vy = (this.state.curValue.y - this.lastState.curValue.y) / (Date.now() - this._lastTimeStamp) * 1000;
                            // this.stop();
                        }
                        self.reRender();
                        if (Math.abs(vx) > 50 || Math.abs(vy) > 50 && !(vx && vy)) {
                            this.stop();
                            //需要开启spring弹簧动画,只有在单方向是开启
                            if (Math.abs(vy) > 50) {
                                self._animation = new SpringAnimation(null, '', vy, 20, 180, 0, 0, 2000, 1);
                                self._animation.onFrameCB = function () {
                                    self.springOffset.y = this.state.curValue;
                                    self.reRender();
                                };
                                self._animation.didStopCB = function () {
                                    self.springOffset.y = this.state.curValue;
                                    self.reRender();
                                };
                                self._animation.start();
                            } else if (Math.abs(vx) > 50) {
                                self._animation = new SpringAnimation(null, '', vx, 20, 180, 0, 0, 2000, 1);
                                self._animation.onFrameCB = function () {
                                    self.springOffset.x = this.state.curValue;
                                    self.reRender();
                                };
                                self._animation.didStopCB = function () {
                                    self.springOffset.x = this.state.curValue;
                                    self.reRender();
                                };
                                self._animation.start();
                            }
                        }
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

        if (this.scrollVEnabled || this.scrollHEnabled) {
            diff.x = pos.x - this.mouseDownPos.x;
            diff.y = pos.y - this.mouseDownPos.y;
            if (this.scrollVEnabled) {
                if (diff.y < 0) {
                    //内容向上
                    if (this.contentOffset.y <= this.limitY.min) {
                        this.contentOffset.y = this.limitY.min;
                        //到达下边缘
                        this.springOffset.y = rubberBanding(diff.y, this.height);
                    } else {
                        this.mouseDownPos.y = pos.y;
                        this.contentOffset.y += diff.y;
                    }
                } else {
                    //内容向下
                    if (this.contentOffset.y >= this.limitY.max) {
                        //到达上边缘
                        this.contentOffset.y = this.limitY.max;
                        this.springOffset.y = rubberBanding(diff.y, this.height);
                    } else {
                        this.mouseDownPos.y = pos.y;
                        this.contentOffset.y += diff.y;
                    }
                }
            }

            if (this.scrollHEnabled) {
                if (diff.x < 0) {
                    //内容向左
                    if (this.contentOffset.x <= this.limitX.min) {
                        //到达左边缘
                        this.contentOffset.x = this.limitX.min;
                        this.springOffset.x = rubberBanding(diff.x, this.width);
                    } else {
                        this.mouseDownPos.x = pos.x;
                        this.contentOffset.x += diff.x;
                    }
                } else {
                    //内容向右
                    if (this.contentOffset.x >= this.limitX.max) {
                        //到达右边缘
                        this.contentOffset.x = this.limitX.max;
                        this.springOffset.x = rubberBanding(diff.x, this.width);
                    } else {
                        this.mouseDownPos.x = pos.x;
                        this.contentOffset.x += diff.x;
                    }
                }
            }
            this.reRender();
        }
    }
}

return SXRender;

})));
