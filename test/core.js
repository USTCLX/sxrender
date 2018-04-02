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
 * 重新包装event对象
 * @param e原始event对象
 */
var eventUtil = function eventUtil(ev, pre) {
    var eleRect = getRelativeRect(ev);

    if (ev.offsetX === undefined || ev.offsetY === undefined) {
        ev.offsetX = eleRect.x;
        ev.offsetY = eleRect.y;
    }

    if (ev.movementX === undefined || ev.movementY == undefined) {
        ev.movementX = pre.pointX === 0 ? 0 : ev.pageX - pre.pointX;
        ev.movementY = pre.pointY === 0 ? 0 : ev.pageY - pre.pointY;
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
        return -(1 - 1 / (-x * c / d + 1)) * d;
    }
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

/**
 * 简单的多对象扩展器，会自动覆盖
 * @param target
 * @param rest
 * @returns {*}
 */
var extend = function extend(target) {
    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
    }

    for (var i = 0; i < rest.length; i++) {
        var source = rest[i];
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

/**
 * 获取准确的当前时间
 * @returns {number}
 */
var getNow = function getNow() {
    return window.performance && window.performance.now ? window.performance.now() + window.performance.timing.navigationStart : +new Date();
};

/**
 * s
 * @type {{swipe: {style: string}}}
 */
var Ease = {
    //easeOutQuint
    swipe: {
        style: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fn: function fn(t) {
            return 1 + --t * t * t * t * t;
        }
    },
    //easeOutQuard
    swipeBounce: {
        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fn: function fn(t) {
            return t * (2 - t);
        }
    },
    //easeOutQuart
    //此曲线也可用于弹回效果，先快后慢
    bounce: {
        style: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fn: function fn(t) {
            return 1 - --t * t * t * t;
        }
    },
    spring: {
        //弹簧效果，并没有具体实现，而是使用了SpringAnimation类来实现。此处用于判断
        style: 'spring',
        fn: function fn() {}
    }
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
        var _h = this._handlers[event.type];

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
 * Created by lixiang on 2018/2/26.
 */

var Painter = function () {
    function Painter(canvas, backCanvas, storage, params, options) {
        classCallCheck(this, Painter);

        this.canvas = canvas;
        this.backCanvas = backCanvas;
        this.storage = storage;
        this.objects = this.storage.objects;
        this.params = params;
        this.options = options;

        this.ctx = canvas.getContext('2d');
        this.bgCtx = backCanvas.getContext('2d');
    }

    createClass(Painter, [{
        key: 'renderAll',
        value: function renderAll() {
            var objs = this.objects;
            var params = this.params;
            var options = this.options;
            var ctx = this.ctx;

            //clear zone
            clearCtx(ctx, { w: this.canvas.width, h: this.canvas.height });

            for (var i = 0, il = objs.length; i < il; i++) {
                switch (objs[i].type) {
                    case GraphType.Rect:
                        drawRect(ctx, objs[i]);
                        break;
                    case GraphType.Circle:
                        drawCircle(ctx, objs[i]);
                        break;
                    case GraphType.Image:
                        drawImage(ctx, objs[i]);
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
            // drawScrollBar(ctx, params, options);
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
    ctx.save();
    ctx.clearRect(x, y, w, h);
    ctx.restore();
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
 * Created by lixiang on 2018/3/23.
 */
var DEFAULT_OPTIONS = {
    width: 500,
    height: 500,
    contentWidth: 500,
    contentHeight: 500,
    backgroundColor: '',
    backgroundImage: '',
    scrollBar: false,
    scrollBarFade: false,
    disableTouch: true,
    disableMouse: false,
    preventDefault: true,
    stopPropagation: true,
    momentum: true,
    momentumLimitTime: 300,
    momentumLimitDistance: 15,
    bounce: true, //是否开启弹跳效果，回弹效果
    bounceTime: 800, //弹跳动画的持续时间，普遍采用800
    swipeTime: 2500, //动量滚动持续时间
    swipeBounceTime: 500 //动量滚动并遇上边界弹跳，持续时间
};

//scroll 的默认参数
var DEFAULT_PARAMS = {
    x: 0,
    y: 0,
    distX: 0, //鼠标按下后，移动的绝对距离
    distY: 0,
    pointX: 0, //鼠标按下的点，相对于page,并在移动时更新
    pointY: 0,
    startX: 0, //移动的开始位置
    startY: 0,
    scroll: false, //是否可以滚动，
    scrollX: false, //是否可以沿X轴滚动
    scrollY: false, //是否可以沿Y轴滚动
    scrolling: false, //是否正在scroll中
    maxScrollX: 0,
    minScrollX: 0,
    maxScrollY: 0,
    minScrollY: 0,
    overflowX: 0, //开启bounce时，超出的长度
    overflowY: 0,
    animateTimer: null, //动画的引用
    isAnimating: false, //是否正在动画
    startTime: 0,
    endTime: 0
};

var Init = {
    _handleOptions: function _handleOptions(opts) {
        if (opts.contentWidth === undefined || opts.contentWidth < opts.width) {
            opts.contentWidth = opts.width;
        }

        if (opts.contentHeight === undefined || opts.contentHeight < opts.height) {
            opts.contentHeight = opts.height;
        }

        this.options = extend({}, DEFAULT_OPTIONS, opts);
    },

    _handleElements: function _handleElements(id) {
        this._rootEle = document.getElementById(id);

        this._wrapperEle = document.createElement("div");
        this._canvasEle = document.createElement("canvas");
        this._bgCanvasEle = document.createElement("canvas");

        this._wrapperEle.style.position = "relative";
        this._wrapperEle.style.margin = "auto";
        this._wrapperEle.style.width = this.options.width + "px";
        this._wrapperEle.style.height = this.options.height + "px";

        this._canvasEle.style.position = "absolute";
        this._canvasEle.width = this.options.width;
        this._canvasEle.height = this.options.height;

        this._bgCanvasEle.style.position = "absolute";
        this._bgCanvasEle.width = this.options.width;
        this._bgCanvasEle.height = this.options.height;

        this._wrapperEle.appendChild(this._bgCanvasEle);
        this._wrapperEle.appendChild(this._canvasEle);

        this._rootEle.appendChild(this._wrapperEle);
    },

    _handleDomEvents: function _handleDomEvents() {
        if (!this.options.disableMouse) {
            this._canvasEle.addEventListener("mousedown", this, false);
            this._canvasEle.addEventListener("mouseup", this, false);
            this._canvasEle.addEventListener("mousemove", this, false);
            this._canvasEle.addEventListener("mouseout", this, false);
        }

        if (!this.options.disableTouch) {
            this._canvasEle.addEventListener("touchstart", this, false);
            this._canvasEle.addEventListener("touchmove", this, false);
            this._canvasEle.addEventListener("touchcancel", this, false);
            this._canvasEle.addEventListener("touchend", this, false);
        }
    },

    _handleCustomEvents: function _handleCustomEvents() {},

    _handleInit: function _handleInit() {
        this._params = extend({}, DEFAULT_PARAMS);
        this._storage = new Storage();
        this._painter = new Painter(this._canvasEle, this._bgCanvasEle, this._storage, this._params, this.options);

        this._params.scrollX = this.options.contentWidth > this.options.width ? true : false;
        this._params.scrollY = this.options.contentHeight > this.options.height ? true : false;
        this._params.scroll = this._params.scrollX || this._params.scrollY;
        this._params.minScrollX = this.options.width - this.options.contentWidth;
        this._params.minScrollY = this.options.height - this.options.contentHeight;

        var bgColor = this.options.backgroundColor;
        var bgImage = this.options.backgroundImage;

        if (!!bgColor && checkType(bgColor) === BaseType.String) {
            this._bgCanvasEle.style.backgroundColor = bgColor;
        }

        if (!!bgImage && checkType(bgImage) === BaseType.String) {
            this._bgCanvasEle.style.background = bgImage;
        }

        this._painter.renderAll();
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
function State(stateType, repeat, curFrame, curValue, reversing) {
    this.stateType = stateType || stateTypes.idle;
    this.repeat = repeat || 0;
    this.curFrame = curFrame || 0;
    this.curValue = curValue;
    this.reversing = reversing || false;
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

    this.state.curValue = this._interpolateValue(this.startValue, this.stopValue, this._p);

    if (this.target && this.key) {
        this._changeTargetValue();
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
        this._changeTargetValue();
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
    },
    _changeTargetValue: function _changeTargetValue() {
        var state = this.state;
        var key = this.key;
        var target = this.target;
        if (key instanceof String && state.curValue.hasOwnProperty(this.key)) {

            target[key] = state.curValue;
        } else if (key instanceof Array) {

            key.forEach(function (item) {
                if (state.curValue.hasOwnProperty(item) && target.hasOwnProperty(item)) {
                    target[item] = state.curValue[item];
                }
            });
        }
    },
    _interpolateValue: function _interpolateValue(startValue, stopValue, factor) {
        var type = checkType(startValue);
        var self = this;
        switch (type) {
            case BaseType.Array:
                return startValue.map(function (sv, i) {
                    return self._interpolateValue(sv, stopValue[i], factor);
                });
            case BaseType.Object:
                var obj = {};
                for (var key in startValue) {
                    if (startValue.hasOwnProperty(key)) {
                        obj[key] = this._interpolateValue(startValue[key], stopValue[key], factor);
                    }
                }
                return obj;
            case BaseType.Number:
                return Math.round(startValue + factor * (stopValue - startValue));
            default:
                console.error('not match type in interpolate value');
                break;
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
 *
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

    this.state.curValue = this._interpolateValue(this.startValue, this.stopValue, this._p);

    if (this.target && this.key) {
        this._changeTargetValue();
    }

    this.onFrameCB && this.onFrameCB();
    if (this.state.curFrame < this._totalFrames) {
        requestAnimationFrame(springAnimateHandler.bind(this), this._timeStep);
    } else {
        this.state.curValue = this.stopValue;
        this._changeTargetValue();
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

//create by lixiang in 2018/3/28

var Scroll = {
    /**
     * 开始滚动事件
     * 鼠标按下，手指按下时触发
     * @param e
     * @private
     */
    _startScroll: function _startScroll(e) {
        //不能scroll直接返回
        var params = this._params;
        var options = this.options;

        if (!params.scroll) {
            return;
        }

        if (options.preventDefault) {
            e.preventDefault();
        }

        if (options.stopPropagation) {
            e.stopPropagation();
        }

        params.scrolling = true;

        params.pointX = e.pageX;
        params.pointY = e.pageY;

        params.distX = 0;
        params.distY = 0;

        params.startX = params.x;
        params.startY = params.y;

        params.startTime = getNow();

        this._stopScroll();
    },

    /**
     * 正在滚动事件
     * 鼠标在画布上移动时触发
     * @param e
     * @private
     */
    _moveScroll: function _moveScroll(e) {
        //不能scroll或者不处于scrolling，直接返回
        var params = this._params;
        var options = this.options;
        var newX = void 0,
            newY = void 0;
        var timestamp = void 0;

        if (!params.scroll || !params.scrolling) {
            return;
        }

        if (options.preventDefault) {
            e.preventDefault();
        }

        if (options.stopPropagation) {
            e.stopPropagation();
        }

        timestamp = getNow();

        params.distX += e.movementX;
        params.distY += e.movementY;
        params.pointX = e.pageX;
        params.pointY = e.pageY;

        newX = params.x + e.movementX;
        newY = params.y + e.movementY;

        if (!params.scrollX) {
            newX = 0;
        }
        if (!params.scrollY) {
            newY = 0;
        }

        //到达边缘，减速或停止移动
        if (newX < params.minScrollX || newX > params.maxScrollX) {
            if (options.bounce) {
                params.overflowX += e.movementX;
                newX = (newX < params.minScrollX ? params.minScrollX : params.maxScrollX) + rubberBanding(params.overflowX, options.width);
            } else {
                newX = newX < params.minScrollX ? params.minScrollX : params.maxScrollX;
            }
        }

        if (newY < params.minScrollY || newY > params.maxScrollY) {
            if (options.bounce) {
                params.overflowY += e.movementY;
                newY = (newY < params.minScrollY ? params.minScrollY : params.maxScrollY) + rubberBanding(params.overflowY, options.height);
            } else {
                newY = newY < params.minScrollY ? params.minScrollY : params.maxScrollY;
            }
        }

        if (timestamp - params.startTime > options.momentumLimitTime) {
            params.startTime = timestamp;
            params.startX = params.x;
            params.startY = params.y;
        }

        this._translate(newX, newY);
    },

    /**
     * 结束滚动事件
     * 鼠标抬起时触发
     * @param e
     * @private
     */
    _endScroll: function _endScroll(e) {
        var params = this._params;
        var options = this.options;

        var newX = Math.round(params.x);
        var newY = Math.round(params.y);
        var time = void 0;
        var easing = Ease.swipe;

        //不能滚动或者不处于滚动中，直接返回
        if (!params.scroll || !params.scrolling) {
            return;
        }
        params.scrolling = false;

        //如果超出边界，就重置位置，并且重置结束后直接返回，不用执行动量动画
        if (this._resetPosition(options.bounceTime, Ease.spring)) {
            return;
        }

        params.endTime = getNow();

        var duration = params.endTime - params.startTime;
        var absDistX = Math.abs(newX - params.startX);
        var absDistY = Math.abs(newY - params.startY);

        //开启动量动画，并且按住的持续之间小于300，并且移动距离大于15，认为是滚动状态，否则认为是静止状态，不需要开启动画
        if (options.momentum && duration < options.momentumLimitTime && (absDistX > options.momentumLimitDistance || absDistY > options.momentumLimitDistance)) {
            var momentumX = this._momentum(newX, params.startX, duration, params.minScrollX, params.maxScrollX);
            var momentumY = this._momentum(newY, params.startY, duration, params.minScrollY, params.maxScrollY);
            newX = momentumX.destination;
            newY = momentumY.destination;
            time = Math.max(momentumX.duration, momentumY.duration);
        }

        if (newX !== params.x || newY !== params.y) {
            this._scrollTo(newX, newY, time, easing);
        }
    },

    /**
     * 使用bounce效果，将内容重新滚动回边界位置。
     * 如果超出边界，返回true，并执行bounce动画
     * 如果未超出边界，返回false，什么都不做
     * @param time  动画持续时间
     * @param easing 时间函数
     * @returns {boolean}
     * @private
     */
    _resetPosition: function _resetPosition() {
        var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var easing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Ease.bounce;

        var params = this._params;
        var x = void 0,
            y = void 0;

        x = params.x;
        y = params.y;

        if (x > params.maxScrollX) {
            x = params.maxScrollX;
        } else if (x < params.minScrollX) {
            x = params.minScrollX;
        }

        if (y > params.maxScrollY) {
            y = params.maxScrollY;
        } else if (y < params.minScrollY) {
            y = params.minScrollY;
        }

        if (x === params.x && y === params.y) {
            return false;
        }

        //开启回弹动画
        this._scrollTo(x, y, time, easing);
        return true;
    },

    /**
     * 将内容自动滚动到某处
     * @param x
     * @param y
     * @param time
     * @param easing
     * @private
     */
    _scrollTo: function _scrollTo(x, y) {
        var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var easing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Ease.bounce;

        //将内容移动到某处，使用动画效果,只能使用js动画
        this._scrollAnimate(x, y, time, easing);
    },

    /**
     * 开启动画动画
     * @param destX  目标位置
     * @param destY
     * @param duration 持续时间
     * @param easingFn
     * @private
     */
    _scrollAnimate: function _scrollAnimate(destX, destY, duration, easingFn, opts) {
        var params = this._params;
        var options = this.options;
        var self = this;

        if (easingFn === Ease.spring) {
            var v = opts && opts.v || 0;
            console.log(params.overflowY, options.height, params.overflowY / options.height);
            var start = opts && opts.start || params.overflowY / options.height;
            params.animateTimer = new SpringAnimation(params, ['x', 'y', 'overflowX', 'overflowY'], v, 12, 180, {
                x: params.x,
                y: params.y,
                overflowX: params.overflowX,
                overflowY: params.overflowY
            }, {
                x: destX,
                y: destY,
                overflowX: 0,
                overflowY: 0
            }, duration, 0);
            params.animateTimer.didStartCB = function () {
                params.isAnimating = true;
            };
            params.animateTimer.onFrameCB = function () {
                self._render();
            };
            params.animateTimer.didStopCB = function () {
                params.isAnimating = false;
                params.animateTimer = null;
            };
            params.animateTimer.start();
        } else if (easingFn === Ease.swipe) {
            params.animateTimer = new Animation(params, ['x', 'y'], { x: params.x, y: params.y }, {
                x: destX,
                y: destY
            }, duration, { timingFun: easingFn.fn });
            params.animateTimer.didStartCB = function () {
                params.isAnimating = true;
            };
            params.animateTimer.onFrameCB = function () {
                self._render();
                //计算是否触碰边界
                var _state$curValue = this.state.curValue,
                    x = _state$curValue.x,
                    y = _state$curValue.y;
                var maxScrollX = params.maxScrollX,
                    minScrollX = params.minScrollX,
                    maxScrollY = params.maxScrollY,
                    minScrollY = params.minScrollY;

                var vx = 0,
                    vy = 0;
                if (x > maxScrollX || x < minScrollX) {
                    var lx = this.lastState.curValue.x;
                    vx = (x - lx) / (getNow() - this._lastTimeStamp) * 1000;
                }
                if (y > maxScrollY || y < minScrollY) {
                    var ly = this.lastState.curValue.y;
                    vy = (y - ly) / (getNow() - this._lastTimeStamp) * 1000;
                }
                if (!!vx || !!vy) {
                    //over boundary
                    var _v = vy;

                    this.stop(); //停止当前动画

                    self._scrollAnimate(0, 0, 2000, Ease.spring, { v: _v, start: 1 });
                }
            };
            params.animateTimer.didStopCB = function () {
                params.isAnimating = false;
                params.animateTimer = null;
            };
            params.animateTimer.start();
        }
    },

    /**
     * 停止滚动
     * 一些参数重置，与回收
     * @private
     */
    _stopScroll: function _stopScroll() {
        var animateTimer = this._params.animateTimer;


        animateTimer && animateTimer.stop();
    },

    /**
     * 将内容变换到某处，随即自动渲染
     * @param newX
     * @param newY
     * @private
     */
    _translate: function _translate(newX, newY) {
        var params = this._params;
        params.x = newX;
        params.y = newY;

        this._render();
    },

    /**
     * 计算动量运动后的位置，设置动量动画的持续时间
     * @param current  当前位置
     * @param start    开始位置
     * @param time     持续时间
     * @param opts
     */
    _momentum: function _momentum(current, start, time, minScroll, maxScroll) {
        var _options = this.options,
            swipeBounceTime = _options.swipeBounceTime,
            swipeTime = _options.swipeTime,
            bounce = _options.bounce;

        var distance = current - start;
        var speed = distance * 1000 * 0.8 / time; //速度以秒为单位，并且衰减一点
        var destination = current + speed;
        var duration = swipeTime;

        if (destination > maxScroll || destination < minScroll) {
            if (bounce) {} else {
                destination = destination > maxScroll ? maxScroll : minScroll;
                duration = swipeBounceTime;
            }
        }

        return {
            destination: Math.round(destination),
            duration: duration
        };
    }
};

/**
 * Created by lixiang on 2018/3/23.
 */

var SXRender = function (_EventDispatcher) {
    inherits(SXRender, _EventDispatcher);

    function SXRender(id, opts) {
        var _ret;

        classCallCheck(this, SXRender);

        var _this = possibleConstructorReturn(this, (SXRender.__proto__ || Object.getPrototypeOf(SXRender)).call(this));

        if (checkType(id) !== BaseType.String || checkType(opts) !== BaseType.Object) {
            throw new Error('params type error!');
            return possibleConstructorReturn(_this);
        }

        _this._handleOptions(opts);
        _this._handleElements(id);
        _this._handleDomEvents();
        _this._handleCustomEvents();
        _this._handleInit();

        return _ret = _this, possibleConstructorReturn(_this, _ret);
    }

    createClass(SXRender, [{
        key: 'handleEvent',
        value: function handleEvent(e) {
            //事件包装
            eventUtil(e, this._params);
            //事件分发
            switch (e.type) {
                case "touchstart":
                case "mousedown":
                    this._startScroll(e);
                    break;
                case "touchmove":
                case "mousemove":
                    this._moveScroll(e);
                    break;
                case "mouseup":
                case "mousecancel":
                case "mouseout":
                case "touchend":
                case "touchcancel":
                    this._endScroll(e);
                    break;
            }
        }
    }, {
        key: '_render',
        value: function _render() {
            this._painter.renderAll();
        }
    }]);
    return SXRender;
}(EventDispatcher);

mixin(SXRender, Init, false);
mixin(SXRender, Scroll, false);

return SXRender;

})));
