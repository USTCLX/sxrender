(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.SXRender = factory());
}(this, (function () { 'use strict';

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
        return (1 - 1 / (-x * c / d + 1)) * d;
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
    function Painter(canvas, backCanvas, storage, params) {
        classCallCheck(this, Painter);

        this.canvas = canvas;
        this.backCanvas = backCanvas;
        this.storage = storage;
        this.objects = this.storage.objects;
        this.params = params;

        this.ctx = canvas.getContext('2d');
        this.bgCtx = backCanvas.getContext('2d');
    }

    createClass(Painter, [{
        key: 'renderAll',
        value: function renderAll() {
            var objs = this.objects;
            console.log('this', this);
            return;
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
    momentumLimitTime: 300,
    momentumLimitDistance: 15,
    bounce: true, //是否开启弹跳效果
    bounceTime: 800, //弹跳动画的持续时间，普遍采用800
    startTime: 0
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
    isAnimating: false //是否正在动画
};

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
        key: '_handleOptions',
        value: function _handleOptions(opts) {
            if (opts.contentWidth === undefined || opts.contentWidth < opts.width) {
                opts.contentWidth = opts.width;
            }

            if (opts.contentHeight === undefined || opts.contentHeight < opts.height) {
                opts.contentHeight = opts.height;
            }

            this.options = extend({}, DEFAULT_OPTIONS, opts);
        }
    }, {
        key: '_handleElements',
        value: function _handleElements(id) {
            this._rootEle = document.getElementById(id);

            this._wrapperEle = document.createElement("div");
            this._canvasEle = document.createElement("canvas");
            this._bgCanvasEle = document.createElement("canvas");

            this._wrapperEle.style.position = "relative";
            this._wrapperEle.style.margin = "auto";
            this._wrapperEle.style.width = this.options.width + "px";
            this._wrapperEle.style.height = this.options.height + "px";

            this._canvasEle.style.position = "absolute";
            this._canvasEle.style.width = this.options.width + "px";
            this._canvasEle.style.height = this.options.height + "px";

            this._bgCanvasEle.style.position = "absolute";
            this._bgCanvasEle.style.width = this.options.width + "px";
            this._bgCanvasEle.style.height = this.options.height + "px";

            this._wrapperEle.appendChild(this._bgCanvasEle);
            this._wrapperEle.appendChild(this._canvasEle);

            this._rootEle.appendChild(this._wrapperEle);
        }
    }, {
        key: '_handleDomEvents',
        value: function _handleDomEvents() {
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
        }
    }, {
        key: '_handleCustomEvents',
        value: function _handleCustomEvents() {
            this.on('scrolling', this.render, this);
        }
    }, {
        key: '_handleInit',
        value: function _handleInit() {
            this._params = extend({}, DEFAULT_PARAMS);
            this._storage = new Storage();
            this._painter = new Painter(this._canvasEle, this._bgCanvasEle, this._storage, this._params);

            this._params.scrollX = this.options.contentWidth > this.options.width ? true : false;
            this._params.scrollY = this.options.contentHeight > this.options.height ? true : false;
            this._params.scroll = this._params.scrollX || this._params.scrollY;
            this._params.minScrollX = this.options.width - this.options.contentWidth;
            this._params.maxScrollX = this.options.height - this.options.contentHeight;

            var bgColor = this.options.backgroundColor;
            var bgImage = this.options.backgroundImage;

            if (!!bgColor && checkType(bgColor) === BaseType.String) {
                this._bgCanvasEle.style.backgroundColor = bgColor;
            }

            if (!!bgImage && checkType(bgImage) === BaseType.String) {
                this._bgCanvasEle.style.background = bgImage;
            }
        }
    }, {
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
                    this.scroll ? this._endScroll(e) : null;
                    break;
            }
        }
    }, {
        key: '_startScroll',
        value: function _startScroll(e) {
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

            params.startTime = getNow();

            this.trigger('beforeScrollStart');
        }
    }, {
        key: '_moveScroll',
        value: function _moveScroll(e) {
            //不能scroll或者不处于scrolling，直接返回
            var params = this._params;
            var options = this.options;
            var newX = void 0,
                newY = void 0;

            if (!params.scroll || !params.scrolling) {
                return;
            }

            if (options.preventDefault) {
                e.preventDefault();
            }

            if (options.stopPropagation) {
                e.stopPropagation();
            }

            params.distX += e.movementX;
            params.distY += e.movementY;
            params.pointX = e.pageX;
            params.pointY = e.pageY;

            newX = params.x + e.movementX;
            newY = params.y + e.movementY;

            if (!options.scrollX) {
                newX = 0;
            }
            if (!options.scrollY) {
                newY = 0;
            }

            //到达边缘，减速或停止移动
            if (newX < params.minScrollX || newX > params.maxScrollX) {
                params.overflowX += e.movementX;
                if (options.bounce) {
                    newX = (newX < params.minScrollX ? params.minScrollX : params.maxScrollX) + rubberBanding(params.overflowX, options.width);
                } else {
                    newX = newX < params.minScrollX ? params.minScrollX : params.maxScrollX;
                }
            }

            if (newY < params.minScrollY || newY > params.maxScrollY) {
                params.overflowY += e.movementY;
                if (options.bounce) {
                    newY = (newY < params.minScrollY ? params.minScrollY : params.maxScrollY) + rubberBanding(params.overflowY, options.height);
                } else {
                    newY = newY < params.minScrollY ? params.minScrollY : params.maxScrollY;
                }
            }

            params.x = newX;
            params.y = newY;

            this.trigger('scrolling');
        }
    }, {
        key: '_endScroll',
        value: function _endScroll(e) {
            //不能滚动，直接返回
            var params = this._params;
            if (!params.scroll) {
                return;
            }

            params.scrolling = false;
        }
    }, {
        key: 'resetPosition',
        value: function resetPosition() {
            
        }
    }, {
        key: 'scrollTo',
        value: function scrollTo(x, y) {
            
        }
    }, {
        key: '_animate',
        value: function _animate(destX, destY, duration, easingFn) {}
    }, {
        key: '_stop',
        value: function _stop() {}
    }, {
        key: 'render',
        value: function render() {
            this._painter.renderAll();
        }
    }]);
    return SXRender;
}(EventDispatcher);

return SXRender;

})));
