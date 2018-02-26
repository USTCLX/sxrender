/**
 * Created by lixiang on 2018/2/26.
 */

class Painter {
    constructor(opts){
        opts = opts||{};
        this.backCtx = opts.backCtx;
        this.ctx = opts.ctx;
        this.objects = opts.objects;
    }
}

export default Painter;
