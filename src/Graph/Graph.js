import EventDispatch from './EventDispatcher';

class Graph extends EventDispatch {
    constructor(x, y, width, height, type) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }
}

export default Graph;