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











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * Created by lixiang on 2018/1/7.
 */

/**
 * 获取元素内相对坐标
 * @param  {[type]} e [description]
 */
var getRelativeRect = function getRelativeRect(ele) {
    var DomRect = void 0;

    DomRect = ele.target.getBoundingClientRect();

    return {
        x: Math.round(ele.clientX - DomRect.x),
        y: Math.round(ele.clientY - DomRect.y)
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
            case GraphType.Circle:
                if (pos.x > obj.x + contentOffset.x - obj.radius && pos.x < obj.x + contentOffset.x + obj.radius && pos.y > obj.y + contentOffset.y - obj.radius && pos.y < obj.y + contentOffset.y + obj.radius) {
                    return obj.id;
                }
                break;
            case GraphType.Rect:
                if (pos.x > obj.x + contentOffset.x && pos.x < obj.x + contentOffset.x + obj.width && pos.y > obj.y + contentOffset.y && pos.y < obj.y + contentOffset.y + obj.height) {
                    return obj.id;
                }
                break;
            case GraphType.Image:
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
        return (1 - 1 / (x * c / d + 1)) * d;
    } else {
        return (1 - 1 / (-x * c / d + 1)) * d;
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
    var copy = void 0;
    if (null === values || "object" !== (typeof values === "undefined" ? "undefined" : _typeof(values))) {
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
 * 返回对象类型，小写字符串
 */
var checkType = function checkType(obj) {
    var str = Object.prototype.toString.call(obj);
    return str.slice(8, str.length - 1).toLowerCase();
};

/**
 * 修饰器/合成器
 * @param {Object/Function} target
 * @param {Object/Function} source
 * @param {boolean} overlay 是否覆盖
 */
var mixin = function mixin(target, source, overlay) {
    target = 'prototype' in target ? target.prototype : target;
    source = 'prototype' in source ? source.prototype : source;

    for (var key in source) {
        if (source.hasOwnProperty(key) && (overlay ? source[key] != null : target[key] == null)) {
            target[key] = source[key];
        }
    }
    return target;
};

var BaseType = {
    String: 'string',
    Object: 'object',
    Function: 'function',
    Boolean: 'boolean',
    Array: 'array',
    RegExp: 'regexp',
    Number: 'number'
};

var GraphType = {
    Rect: 'SX-Rect',
    Circle: 'SX-Circle',
    Image: 'SX-Image'
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
function State(stateType, repeat, curFrame, curValue, reversing) {
    this.stateType = stateType || stateTypes.idle;
    this.repeat = repeat || 0;
    this.curFrame = curFrame || 0;
    this.curValue = curValue;
    this.reversing = reversing || false;
}

//插值
function interpolateNumber(startValue, stopValue, progress, needReverse) {
    if (needReverse) {
        return Math.round(stopValue + progress * (startValue - stopValue));
    } else {
        return Math.round(startValue + progress * (stopValue - startValue));
    }
}

//对象插值
function interpolateObject(startObj, stopObj, progress, needReverse) {
    var obj = Object.assign({}, startObj);
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (needReverse) {
                obj[key] = Math.round(stopObj[key] + progress * (startObj[key] - stopObj[key]));
            } else {
                obj[key] = Math.round(startObj[key] + progress * (stopObj[key] - startObj[key]));
            }
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

    this.state.curValue = this._valueType !== valueTypes.object ? interpolateNumber(this.startValue, this.stopValue, this._p, this.state.resveringeState) : interpolateObject(this.startValue, this.stopValue, this._p, this.state.resveringeState);

    if (this.target && this.target.hasOwnProperty(this.key)) {
        this.target[this.key] = this.state.curValue;
    }

    this.onFrameCB && this.onFrameCB();

    this.lastState = deepClone(this.state);
    this._lastTimeStamp = Date.now();

    if (this.state.curFrame < this._totalFrames) {
        //执行动画
        requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
    } else if (this.autoReverse && !this.state.resveringeState) {
        //自动回溯
        this.state.resveringeState = true;
        this.state.curFrame = 0;
        requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
    } else if (this.state.repeat < this.repeatCount - 1) {
        //重复动画
        this.state.repeat++;
        this.state.curFrame = 0;
        this.state.resveringeState = false;
        requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
    } else {
        this.state.curValue = this.stopValue;
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
        this._timeStep = Math.round(1000 / this.fps);
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
        //reset
        this.state.stateType = stateTypes.idle;
        this.state.curValue = 0;
        this.state.curFrame = 0;
        this.state.repeat = 0;
        this.state.resveringeState = false;

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
            this.state.stateType = stateTypes.running;
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

//事件分发类
function EventDispatcher() {
    this._handlers = {};
}

/**
 * 事件监听器
 * @param event  事件名称
 * @param handler 处理函数
 * @param context  处理函数上下文
 */
EventDispatcher.prototype.on = function (event, handler, context) {
    if (typeof this._handlers[event] === 'undefined') {
        this._handlers[event] = [];
    }
    if (checkType(handler) === BaseType.Function) {
        this._handlers[event].push({
            h: handler,
            one: false,
            ctx: context || this
        });
    }
};

/**
 * 单次事件监听器
 * @param event  事件名称
 * @param handler 处理函数
 * @param context 处理函数上下文
 */
EventDispatcher.prototype.once = function (event, handler, context) {
    if (typeof this._handlers[event] === 'undefined') {
        this._handlers[event] = [];
    }
    if (checkType(handler) === BaseType.Function) {
        this._handlers[event].push({
            h: handler,
            one: true,
            ctx: context || this
        });
    }
};

/**
 * 事件分发器
 * @param event 事件名称
 */
EventDispatcher.prototype.trigger = function (event) {
    if (checkType(event) === BaseType.String) {
        event = { type: event };
    }
    if (!event.target) {
        event.target = this;
    }
    if (!event.type) {
        throw new Error("Event object missing 'type' property");
    }
    if (checkType(this._handlers[event.type]) === BaseType.Array) {
        var _h = this._handlers;

        for (var i = 0, il = _h.length; i < il; i++) {
            _h[i]['h'].call(_h[i]['ctx'], event);
        }
    }
};

/**
 * 带有执行环境的事件分发
 * @param event
 * @param context
 */
EventDispatcher.prototype.triggerWithCtx = function (event, context) {
    if (checkType(event) === BaseType.String) {
        event = { type: event };
    }
    if (!event.target) {
        event.target = this;
    }
    if (!event.type) {
        throw new Error("Event object missing 'type' property");
    }
    if (checkType(this._handlers[event.type]) === BaseType.Array) {
        var _h = this._handlers;

        for (var i = 0, il = _h.length; i < il; i++) {
            _h[i]['h'].call(context, event);
        }
    }
};

/**
 * 取消事件监听
 * @param event 事件名称
 */
EventDispatcher.prototype.off = function (event, handler) {
    var h;
    if (checkType(this._handlers[event]) === BaseType.Array) {
        h = this._handlers[event];
        for (var i = 0, il = h.length; i < il; i++) {
            if (h[i]['h'] === handler) {
                h.splice(i, 1);
                break;
            }
        }
    }
};

/**
 * 图形基类
 * @param opts
 * @constructor
 */

var Graph = function (_EventDispatcher) {
        inherits(Graph, _EventDispatcher);

        function Graph(opts) {
                classCallCheck(this, Graph);

                var _this = possibleConstructorReturn(this, (Graph.__proto__ || Object.getPrototypeOf(Graph)).call(this));

                opts = opts || {};

                //shape
                _this.x = opts.x || 0;
                _this.y = opts.y || 0;
                _this.width = opts.width || 0;
                _this.height = opts.height || 0;

                //style
                _this.fill = opts.fill || '';
                _this.stroke = opts.stroke || '';
                _this.lineWidth = opts.lineWidth || 1;

                //others
                _this.id = opts.id || genGUID();
                _this.draggable = opts.draggable || false;

                return _this;
        }

        return Graph;
}(EventDispatcher);

//old fashion
// function Graph(opts) {
//     opts = opts || {};
//
//     EventDispatcher.call(this);
//
//     //shape
//     this.x = opts.x || 0;
//     this.y = opts.y || 0;
//     this.width = opts.width || 20;
//     this.height = opts.height || 20;
//
//     //style
//     this.fill = opts.fill;
//     this.stroke = opts.stroke;
//     this.lineWidth = opts.lineWidth;
//
//     //others
//     this.id = opts.id || genGUID();
// }
//
// Graph.prototype = Object.create(EventDispatcher);
// Graph.prototype.constructor = Graph;

/**
 * Created by lixiang on 2018/2/26.
 */

var Rect = function (_Graph) {
    inherits(Rect, _Graph);

    function Rect(opts) {
        classCallCheck(this, Rect);

        var _this = possibleConstructorReturn(this, (Rect.__proto__ || Object.getPrototypeOf(Rect)).call(this, opts));

        _this.type = GraphType.Rect;
        return _this;
    }

    return Rect;
}(Graph);

/**
 * Created by lixiang on 2018/2/26.
 */
var Circle = function (_Graph) {
    inherits(Circle, _Graph);

    function Circle(opts) {
        classCallCheck(this, Circle);

        opts = opts || {};

        var _this = possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).call(this, opts));

        _this.radius = opts.radius || 0;
        _this.type = GraphType.Circle;
        return _this;
    }

    return Circle;
}(Graph);

/**
 * Created by lixiang on 2018/2/26.
 * 对外暴露图形接口
 */

var GraphInterface = {

    Rect: function Rect$$1(opts) {
        return new Rect(opts);
    },

    Circle: function Circle$$1(opts) {
        return new Circle(opts);
    }
};

/**
 * Created by lixiang on 2018/2/26.
 */

var Storage = function () {
    function Storage() {
        classCallCheck(this, Storage);

        this.objects = [];
    }

    createClass(Storage, [{
        key: "addObj",
        value: function addObj(obj) {
            this.objects.push(obj);
        }
    }, {
        key: "findById",
        value: function findById(id) {
            var objs = this.objects;
            for (var i = 0, il = objs.length; i < il; i++) {
                if (objs[i].id === id) {
                    return objs[i];
                }
            }
        }
    }, {
        key: "deleteById",
        value: function deleteById(id) {
            var objs = this.objects;
            for (var i = 0, il = objs.length; i < il; i++) {
                if (objs[i].id === id) {
                    objs.splice(i, 1);
                    return;
                }
            }
        }
    }, {
        key: "getAllObjects",
        value: function getAllObjects() {
            return this.objects;
        }
    }]);
    return Storage;
}();

/**
 * Created by lixiang on 2018/2/26.
 */

var Painter = function () {
    function Painter(canvas, backCanvas, storage) {
        classCallCheck(this, Painter);

        this.canvas = canvas;
        this.backCanvas = backCanvas;
        this.storage = storage;
        this.objects = this.storage.objects;

        this.ctx = canvas.getContext('2d');
        this.bgCtx = backCanvas.getContext('2d');
    }

    createClass(Painter, [{
        key: 'renderAll',
        value: function renderAll() {
            var objs = this.objects;
            //clear zone
            clearCtx(this.ctx, { w: this.canvas.width, h: this.canvas.height });
            for (var i = 0, il = objs.length; i < il; i++) {
                switch (objs[i].type) {
                    case GraphType.Rect:
                        drawRect(this.ctx, objs[i]);
                        break;
                    case GraphType.Circle:
                        drawCircle(this.ctx, objs[i]);
                        break;
                    case GraphType.Image:
                        drawImage(this.ctx, objs[i]);
                        break;
                    default:
                        console.error('not match type in render all');
                        break;
                }
            }
        }
    }]);
    return Painter;
}();

function clearCtx(ctx, opts) {
    var x, y, w, h;
    var opts = opts || {};
    x = opts.x || 0;
    y = opts.y || 0;
    w = opts.w || 0;
    h = opts.h || 0;
    ctx.clearRect(x, y, w, h);
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

/**
 * Created by lixiang on 2018/1/7.
 */

var SXRender = function SXRender(opts) {
    var canvas, ctx, id, w, h, bgColor, contentW, contentH, drawScrollBar;
    opts = opts || {};

    id = opts.id || '';
    w = opts.width;
    h = opts.height;
    bgColor = opts.backgroundColor || '';
    contentW = opts.contentWidth || w;
    contentH = opts.contentHeight || h;
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
        this.objects = [];
        this.storage = new Storage();

        //painter
        this.painter = new Painter(this.canvas, this.ctx, null, null, this.storage);

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
    //重新绘制
    render: function render() {
        this.backgroundImg.content ? this.drawBackground() : null;
        this.ctx.setTransform(1, 0, 0, 1, this.contentOffset.x + this.springOffset.x, this.contentOffset.y + this.springOffset.y);
        this.painter.renderAll();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.scrollHEnabled || this.scrollVEnabled && this.drawScrollBar) {
            this.drawProgress();
        }
    },
    //将绘图实例添加至画布并渲染。
    add: function add(obj) {
        this.storage.addObj(obj);
        this.render();
    },
    /**
     * 绘制滚动条
     * @private
     */
    drawProgress: function drawProgress() {
        var top, left, width, height, offset;

        if (this.scrollVEnabled) {
            width = 4;
            height = Math.round(this.height * this.height / this.contentH) - Math.abs(this.springOffset.y);
            height = height < 10 ? 10 : height;
            offset = this.springOffset.y < 0 ? this.springOffset.y : 0;
            top = Math.round(-this.contentOffset.y * this.height / this.contentH) - offset;
            top = top > this.height - 10 ? this.height - 10 : top;
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
            offset = this.springOffset.x < 0 ? this.springOffset.x : 0;
            left = Math.round(-this.contentOffset.x * this.width / this.contentW) - offset;
            this.ctx.save();
            this.ctx.fillStyle = '#888888';
            this.ctx.fillRect(left, top, width, height);
            this.ctx.restore();
        }
    }
};

mixin(SXRender, GraphInterface, false);

/**
 * 鼠标按下事件。
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseDownHandler(e) {
    var pos = getRelativeRect(e);

    this.selectObjId = checkClickElm(this.storage.getAllObjects(), pos, this.contentOffset);
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
                this._animation = new SpringAnimation(null, '', 0, 12, 180, this.springOffset, { x: 0, y: 0 }, 800);
                this._animation.onFrameCB = function () {
                    self.springOffset = this.state.curValue;
                    self.render();
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
                        self.render();
                        if (Math.abs(vx) > 50 || Math.abs(vy) > 50 && !(vx && vy)) {
                            this.stop();
                            //需要开启spring弹簧动画,只有在单方向是开启
                            if (Math.abs(vy) > 50) {
                                self._animation = new SpringAnimation(null, '', vy, 20, 180, 0, 0, 800, 1);
                                self._animation.onFrameCB = function () {
                                    self.springOffset.y = this.state.curValue;
                                    self.render();
                                };
                                self._animation.didStopCB = function () {
                                    self.springOffset.y = this.state.curValue;
                                    self.render();
                                };
                                self._animation.start();
                            } else if (Math.abs(vx) > 50) {
                                self._animation = new SpringAnimation(null, '', vx, 20, 180, 0, 0, 2000, 1);
                                self._animation.onFrameCB = function () {
                                    self.springOffset.x = this.state.curValue;
                                    self.render();
                                };
                                self._animation.didStopCB = function () {
                                    self.springOffset.x = this.state.curValue;
                                    self.render();
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
        selectObj = this.storage.findById(this.selectObjId);
        selectObj.x += diff.x;
        selectObj.y += diff.y;
        this.render();
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
                        console.log('diff.y', diff.y, 'springOffset.y', this.springOffset.y);
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
            this.render();
        }
    }
}

return SXRender;

})));
