/**
 * Created by lixiang on 2018/2/26.
 */

import Graph from './Graph';
import {GraphType} from '../utils/utils'


class Rect extends Graph {
    constructor(opts) {
        super(opts);

        this.type = GraphType.Rect;
    }
}


export default Rect;
