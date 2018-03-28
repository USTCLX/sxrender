/**
 * Created by lixiang on 2018/3/23.
 */

import EventDispatcher from './EventDispatcher';

import {BaseType, checkType, eventUtil, mixin} from "../utils/utils";
import Init from './init';
import Scroll from './scroll';

class SXRender extends EventDispatcher {
    constructor(id, opts) {
        super();

        if ((checkType(id) !== BaseType.String) || (checkType(opts) !== BaseType.Object)) {
            throw new Error('params type error!');
            return;
        }

        this._handleOptions(opts);
        this._handleElements(id);
        this._handleDomEvents();
        this._handleCustomEvents();
        this._handleInit();

        return this;
    }

    handleEvent(e) {
        //事件包装
        eventUtil(e, this._params);
        //事件分发
        switch (e.type) {
            case "touchstart":
            case "mousedown":
                this._startScroll(e);
                break;
            case "touchmove":
            case "mousemove":
                this._moveScroll(e);
                break;
            case "mouseup":
            case "mousecancel":
            case "mouseout":
            case "touchend":
            case "touchcancel":
                this._endScroll(e);
                break;
        }
    }

    _render() {
        this._painter.renderAll();
    }

}

mixin(SXRender, Init, false);
mixin(SXRender, Scroll, false);

export default SXRender;