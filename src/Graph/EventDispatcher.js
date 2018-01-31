import {checkType, BaseType} from '../utils/utils'

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
        })
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
        })
    }
};

/**
 * 事件分发器
 * @param event 事件名称
 */
EventDispatcher.prototype.trigger = function (event) {
    if (checkType(event) === BaseType.String) {
        event = {type: event}
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
            _h[i]['h'].call(_h[i]['ctx'], event)
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
        event = {type: event}
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
            _h[i]['h'].call(context, event)
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

export default EventDispatcher