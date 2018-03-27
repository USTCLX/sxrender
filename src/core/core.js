/**
 * Created by lixiang on 2018/3/23.
 */

import EventDispatcher from './EventDispatcher'
import {Animation, SpringAnimation} from '../Animation';
import {BaseType, checkType, eventUtil, mixin, getNow, rubberBanding, Ease} from "../utils/utils";
import Init from './init'

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

    _startScroll(e) {
        //不能scroll直接返回
        let params = this._params;
        let options = this.options;

        if (!params.scroll) {
            return;
        }

        if (options.preventDefault) {
            e.preventDefault();
        }

        if (options.stopPropagation) {
            e.stopPropagation();
        }

        params.scrolling = true;

        params.pointX = e.pageX;
        params.pointY = e.pageY;

        params.distX = 0;
        params.distY = 0;

        params.startX = params.x;
        params.startY = params.y;

        params.startTime = getNow();

        this._stopScroll();
    }

    _moveScroll(e) {
        //不能scroll或者不处于scrolling，直接返回
        let params = this._params;
        let options = this.options;
        let newX, newY;
        let timestamp;

        if (!params.scroll || !params.scrolling) {
            return;
        }

        if (options.preventDefault) {
            e.preventDefault();
        }

        if (options.stopPropagation) {
            e.stopPropagation();
        }

        timestamp = getNow();

        params.distX += e.movementX;
        params.distY += e.movementY;
        params.pointX = e.pageX;
        params.pointY = e.pageY;

        newX = params.x + e.movementX;
        newY = params.y + e.movementY;

        if (!params.scrollX) {
            newX = 0;
        }
        if (!params.scrollY) {
            newY = 0;
        }

        //到达边缘，减速或停止移动
        if (newX < params.minScrollX || newX > params.maxScrollX) {
            if (options.bounce) {
                params.overflowX += e.movementX;
                newX = (newX < params.minScrollX ? params.minScrollX : params.maxScrollX) + rubberBanding(params.overflowX, options.width);
            } else {
                newX = (newX < params.minScrollX) ? params.minScrollX : params.maxScrollX;
            }
        }

        if (newY < params.minScrollY || newY > params.maxScrollY) {
            if (options.bounce) {
                params.overflowY += e.movementY;
                newY = (newY < params.minScrollY ? params.minScrollY : params.maxScrollY) + rubberBanding(params.overflowY, options.height);
            } else {
                newY = (newY < params.minScrollY) ? params.minScrollY : params.maxScrollY;
            }
        }

        if (timestamp - params.startTime > options.momentumLimitTime) {
            params.startTime = timestamp;
            params.startX = this.x;
            params.startY = this.y;
        }

        this._translate(newX, newY);
    }

    _endScroll(e) {
        let params = this._params;
        let options = this.options;

        //不能滚动，直接返回
        if (!params.scroll) {
            return;
        }
        params.scrolling = false;

        //如果超出边界，就重置位置，并且重置结束后直接返回，不用执行动量动画
        if (this._resetPosition(options.bounceTime, Ease.bounce)) {
            return;
        }
    }

    _resetPosition(time = 0, easing = Ease.bounce) {
        let params = this._params;
        let options = this.options;
        let x, y;

        x = Math.round(params.x);
        y = Math.round(params.y);

        if (x > params.maxScrollX) {
            x = params.maxScrollX;
        } else if (x < params.minScrollX) {
            x = params.minScrollX
        }

        if (y > params.maxScrollY) {
            y = params.maxScrollY;
        } else if (y < params.minScrollY) {
            y = params.minScrollY;
        }

        if (x === params.x && y === params.y) {
            return false;
        }

        //开启回弹动画
        this._scrollTo(x, y, time, easing);
        return true;
    }

    _scrollTo(x, y, time = 0, easing = Ease.bounce) {
        //将内容移动到某处，使用动画效果,只能使用js动画
        this._scrollAnimate(x, y, time, easing);
    }

    _scrollAnimate(destX, destY, duration, easingFn) {
        let params = this._params;
        let options = this.options;
        let self = this;
        params.isAnimating = true;
        params.animateTimer = new Animation(null, '', {x: params.x, y: params.y,overflowX:params.overflowX,overflowY:params.overflowY}, {
            x: destX,
            y: destY,
            overflowX:0,
            overflowY:0
        }, options.bounceTime);
        params.animateTimer.onFrameCB = function () {
            params.overflowX = this.state.curValue.overflowX;
            params.overflowY = this.state.curValue.overflowY;
            self._translate(this.state.curValue.x, this.state.curValue.y);
        };
        params.animateTimer.start();
    }

    _stopScroll() {
        let params = this._params;

        params.animateTimer && params.animateTimer.stop();
    }

    _translate(newX, newY) {
        let params = this._params;
        params.x = newX;
        params.y = newY;

        this._painter.renderAll();
    }

}

mixin(SXRender, Init, false);

export default SXRender;