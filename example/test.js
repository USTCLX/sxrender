/**
 *测试一些代码
 */

function EventDispatcher() {
    this._listeners = {};
}

EventDispatcher.prototype.addEventListener = function (type, listener) {
    if (this._listeners[type] === undefined) {
        this._listeners[type] = [];
    }
    this._listeners[type].push(listener.bind(this));
};

EventDispatcher.prototype.dispatch = function (type) {
    var listeners;
    if (this._listeners[type]) {
        listeners = this._listeners[type];
        for (var i = 0, il = listeners.length; i < il; i++) {
            listeners[i] && listeners[i](type);
        }
    }
};

EventDispatcher.prototype.removeEventListener = function (type, listener) {
    var listeners;
    if (this._listeners[type]) {
        listeners = this._listeners[type];
        for (var i = 0, il = listeners.length; i < il; i++) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
                break;
            }
        }
    }
};

function Graph(name) {
    this.name = name || 'default'
}

Graph.prototype = new EventDispatcher();
Graph.prototype.constructor = Graph;

var handler = function(){
    console.log('handler',this);
};

var o1 = new Graph('o1');
var o2 = new Graph('o2');

o1.addEventListener('click',handler);
o2.addEventListener('click',handler);

o1.dispatch('click');
