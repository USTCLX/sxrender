import EventDispatcher from './EventDispatcher';

/**
 * 图形基类
 * @param opts
 * @constructor
 */
function Graph(opts) {
    opts = opts || {};

    EventDispatcher.call(this);

    //shape
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width;
    this.height = opts.height;

    //style
    this.fill = opts.fill;
    this.stroke = opts.stroke;
    this.lineWidth = opts.lineWidth;
}

Graph.prototype = Object.create(EventDispatcher);
Graph.prototype.constructor = Graph;


export default Graph;