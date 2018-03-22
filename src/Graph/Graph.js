import EventDispatcher from './EventDispatcher';
import {genGUID} from '../utils/utils';

/**
 * 图形基类
 * @param opts
 * @constructor
 */
class Graph extends EventDispatcher {
    constructor(opts) {
        super();

        opts = opts || {};

        //shape
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.width = opts.width || 0;
        this.height = opts.height || 0;

        //style
        this.fill = opts.fill || '';
        this.stroke = opts.stroke || '';
        this.lineWidth = opts.lineWidth || 1;

        //others
        this.id = opts.id || genGUID();
        this.draggable = opts.draggable || false;

    }
}

export default Graph;


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