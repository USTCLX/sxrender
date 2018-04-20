/**
 * Created by lixiang on 2018/1/7.
 */


/**
 * 获取元素内相对坐标
 * @param  {[type]} e [description]
 */
const getRelativeRect = function (ele) {
    let DomRect;

    DomRect = ele.target.getBoundingClientRect();

    return {
        x: Math.round(ele.clientX - DomRect.x),
        y: Math.round(ele.clientY - DomRect.y),
    }
};

/**
 * 重新包装event对象
 * @param e原始event对象
 */
const eventUtil = function (ev, pre) {
    let eleRect = getRelativeRect(ev);

    if (ev.offsetX === undefined || ev.offsetY === undefined) {
        ev.offsetX = eleRect.x;
        ev.offsetY = eleRect.y;
    }

    if (ev.movementX === undefined || ev.movementY == undefined) {
        ev.movementX = (pre.pointX === 0) ? 0 : (ev.pageX - pre.pointX);
        ev.movementY = (pre.pointY === 0) ? 0 : (ev.pageY - pre.pointY);
    }
};

/**
 * 检查点击区域是否有对象,返回对象ID。如果点击空白区域，认为在扒页面
 * @param  {[type]} objs     [description]
 * @param  {[type]} clickPos [description]
 */
const checkClickElm = function (objs, clickPos, contentOffset) {
    let obj = null;
    let pos = clickPos;
    for (let i = 0, il = objs.length; i < il; i++) {
        obj = objs[i];
        if (obj.draggable !== true) {
            continue;
        }
        switch (obj.type) {
            case GraphType.Circle:
                if ((pos.x > (obj.x + contentOffset.x - obj.radius)) && (pos.x < (obj.x + contentOffset.x + obj.radius)) && (pos.y > (obj.y + contentOffset.y - obj.radius)) && (pos.y < (obj.y + contentOffset.y + obj.radius))) {
                    return obj.id;
                }
                break;
            case GraphType.Rect:
                if ((pos.x > (obj.x + contentOffset.x)) && (pos.x < (obj.x + contentOffset.x + obj.width)) && (pos.y > (obj.y + contentOffset.y)) && (pos.y < (obj.y + contentOffset.y + obj.height))) {
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
const rubberBanding = function (x, d) {
    const c = 0.55;
    if (x > 0) {
        return (1 - (1 / ((x * c / d) + 1))) * d;
    } else {
        return -(1 - (1 / ((-x * c / d) + 1))) * d;
    }
};


/**
 * 生成uuid
 * @returns {string}
 */
const genGUID = function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxx".replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = (c === 'x') ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
};

/**
 * 深拷贝
 */
const deepClone = function (values) {
    let copy;
    if (null === values || "object" !== typeof values) {
        return values
    }

    if (values instanceof Date) {
        copy = new Date();
        copy.setTime(values.getTime());
        return copy;
    }

    if (values instanceof Array) {
        copy = [];
        for (let i = 0, len = values.length; i < len; i++) {
            copy[i] = deepClone(values[i]);
        }
        return copy;
    }

    if (values instanceof Object) {
        copy = {};
        for (let key in values) {
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
const checkType = function (obj) {
    let str = Object.prototype.toString.call(obj);
    return str.slice(8, str.length - 1).toLowerCase();
};

/**
 * 修饰器/合成器
 * @param {Object/Function} target
 * @param {Object/Function} source
 * @param {boolean} overlay 是否覆盖
 */
const mixin = function (target, source, overlay) {
    target = 'prototype' in target ? target.prototype : target;
    source = 'prototype' in source ? source.prototype : source;

    for (let key in source) {
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
const extend = function (target, ...rest) {
    for (let i = 0; i < rest.length; i++) {
        let source = rest[i];
        for (let key in source) {
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
const getNow = function () {
    return window.performance && window.performance.now ? (window.performance.now() + window.performance.timing.navigationStart) : +new Date()
};


/**
 * 判断一个对象是否是数组
 * @param obj
 */
const isArray = function (obj) {
    return checkType(obj) === BaseType.Array;
};

/**
 * 判断一个对象是否是字符串
 * @param obj
 * @returns {boolean}
 */
const isString = function (obj) {
    return checkType(obj) === BaseType.String;
};

/**
 * 判断一个对象是否是数字
 * @param obj
 * @returns {boolean}
 */
const isNumber = function (obj) {
    return checkType(obj) === BaseType.Number;
};

/**
 * 判断一个对象是否是个纯对象
 * @param obj
 * @returns {boolean}
 */
const isObject = function (obj) {
    return checkType(obj) === BaseType.Object;
};

/**
 * s
 * @type {{swipe: {style: string}}}
 */
const Ease = {
    //easeOutQuint
    swipe: {
        style: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fn: function (t) {
            return 1 + (--t * t * t * t * t);
        }
    },
    //easeOutQuard
    swipeBounce: {
        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fn: function (t) {
            return t * (2 - t);
        }
    },
    //easeOutQuart
    //此曲线也可用于弹回效果，先快后慢
    bounce: {
        style: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fn: function (t) {
            return 1 - (--t * t * t * t);
        }
    },
    spring: {
        //弹簧效果，并没有具体实现，而是使用了SpringAnimation类来实现。此处用于判断
        style: 'spring',
        fn: function () {

        }
    }
};


const BaseType = {
    String: 'string',
    Object: 'object',
    Function: 'function',
    Boolean: 'boolean',
    Array: 'array',
    RegExp: 'regexp',
    Number: 'number'
};

const GraphType = {
    Rect: 'SX-Rect',
    Circle: 'SX-Circle',
    Image: 'SX-Image'
};

export {
    getRelativeRect,
    eventUtil,
    rubberBanding,
    checkClickElm,
    genGUID,
    deepClone,
    checkType,
    mixin,
    extend,
    getNow,
    isArray,
    isNumber,
    isObject,
    isString,
    Ease,
    BaseType,
    GraphType
};