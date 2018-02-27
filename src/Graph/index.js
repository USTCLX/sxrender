/**
 * Created by lixiang on 2018/2/26.
 * 对外暴露图形接口
 */

import Rect from './Rect';
import Circle from './Circle';

const GraphInterface = {

    Rect: (opts) => new Rect(opts),

    Circle: (opts) => new Circle(opts)
};

export default GraphInterface;


