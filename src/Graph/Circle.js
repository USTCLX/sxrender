/**
 * Created by lixiang on 2018/2/26.
 */
import Graph from './Graph';
import {GraphType} from '../utils/utils';

class Circle extends Graph {
    constructor(opts){
        opts = opts||{};
        super(opts);
        this.radius = opts.radius||0;
        this.type = GraphType.Circle;
    }
}

export default Circle;
