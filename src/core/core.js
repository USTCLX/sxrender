/**
 * Created by lixiang on 2018/3/23.
 */

import EventDispatcher from './EventDispatcher'
import Painter from '../painter/painter';
import Storage from '../storage/storage';
import {BaseType, checkType, eventUtil, extend, getNow, rubberBanding, Ease} from "../utils/utils";

const DEFAULT_OPTIONS = {
    width: 500,
    height: 500,
    contentWidth: 500,
    contentHeight: 500,
    backgroundColor: '',
    backgroundImage: '',
    scrollBar: false,
    scrollBarFade: false,
    disableTouch: true,
    disableMouse: false,
    preventDefault: true,
    stopPropagation: true,
    momentumLimitTime: 300,
    momentumLimitDistance: 15,
    bounce: true,//是否开启弹跳效果
    bounceTime: 800,//弹跳动画的持续时间，普遍采用800
    startTime:0
};

//scroll 的默认参数
const DEFAULT_PARAMS = {
    x:0,
    y:0,
    distX:0, //鼠标按下后，移动的绝对距离
    distY:0,
    pointX:0, //鼠标按下的点，相对于page,并在移动时更新
    pointY:0,
    startX:0, //移动的开始位置
    startY:0,
    scroll:false,//是否可以滚动，
    scrollX:false,//是否可以沿X轴滚动
    scrollY:false,//是否可以沿Y轴滚动
    scrolling:false,//是否正在scroll中
    maxScrollX:0,
    minScrollX:0,
    maxScrollY:0,
    minScrollY:0,
    overflowX:0,//开启bounce时，超出的长度
    overflowY:0,
    animateTimer:null,  //动画的引用
    isAnimating:false  //是否正在动画
};

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

    _handleOptions(opts) {
        if (opts.contentWidth === undefined || opts.contentWidth < opts.width) {
            opts.contentWidth = opts.width;
        }

        if (opts.contentHeight === undefined || opts.contentHeight < opts.height) {
            opts.contentHeight = opts.height;
        }

        this.options = extend({}, DEFAULT_OPTIONS, opts);
    }

    _handleElements(id) {
        this._rootEle = document.getElementById(id);

        this._wrapperEle = document.createElement("div");
        this._canvasEle = document.createElement("canvas");
        this._bgCanvasEle = document.createElement("canvas");

        this._wrapperEle.style.position = "relative";
        this._wrapperEle.style.margin = "auto";
        this._wrapperEle.style.width = this.options.width + "px";
        this._wrapperEle.style.height = this.options.height + "px";

        this._canvasEle.style.position = "absolute";
        this._canvasEle.style.width = this.options.width + "px";
        this._canvasEle.style.height = this.options.height + "px";

        this._bgCanvasEle.style.position = "absolute";
        this._bgCanvasEle.style.width = this.options.width + "px";
        this._bgCanvasEle.style.height = this.options.height + "px";

        this._wrapperEle.appendChild(this._bgCanvasEle);
        this._wrapperEle.appendChild(this._canvasEle);

        this._rootEle.appendChild(this._wrapperEle);
    }

    _handleDomEvents() {
        if (!this.options.disableMouse) {
            this._canvasEle.addEventListener("mousedown", this, false);
            this._canvasEle.addEventListener("mouseup", this, false);
            this._canvasEle.addEventListener("mousemove", this, false);
            this._canvasEle.addEventListener("mouseout", this, false);
        }

        if (!this.options.disableTouch) {
            this._canvasEle.addEventListener("touchstart", this, false);
            this._canvasEle.addEventListener("touchmove", this, false);
            this._canvasEle.addEventListener("touchcancel", this, false);
            this._canvasEle.addEventListener("touchend", this, false);
        }
    }

    _handleCustomEvents(){
        this.on('scrolling',this.render,this);
    }

    _handleInit() {
        this._params = extend({},DEFAULT_PARAMS);
        this._storage = new Storage();
        this._painter = new Painter(this._canvasEle, this._bgCanvasEle, this._storage,this._params);

        this._params.scrollX = (this.options.contentWidth > this.options.width) ? true: false;
        this._params.scrollY = (this.options.contentHeight > this.options.height) ? true : false;
        this._params.scroll = this._params.scrollX||this._params.scrollY;
        this._params.minScrollX = this.options.width-this.options.contentWidth;
        this._params.maxScrollX = this.options.height-this.options.contentHeight;

        let bgColor = this.options.backgroundColor;
        let bgImage = this.options.backgroundImage;

        if (!!bgColor && (checkType(bgColor) === BaseType.String)) {
            this._bgCanvasEle.style.backgroundColor = bgColor;
        }

        if (!!bgImage && (checkType(bgImage) === BaseType.String)) {
            this._bgCanvasEle.style.background = bgImage;
        }
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
                this.scroll ? this._endScroll(e) : null;
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

        params.startTime = getNow();

        this.trigger('beforeScrollStart');
    }

    _moveScroll(e) {
        //不能scroll或者不处于scrolling，直接返回
        let params = this._params;
        let options = this.options;
        let newX, newY;

        if (!params.scroll || !params.scrolling) {
            return;
        }

        if (options.preventDefault) {
            e.preventDefault();
        }

        if (options.stopPropagation) {
            e.stopPropagation();
        }

        params.distX += e.movementX;
        params.distY += e.movementY;
        params.pointX = e.pageX;
        params.pointY = e.pageY;

        newX = params.x + e.movementX;
        newY = params.y + e.movementY;

        if (!options.scrollX) {
            newX = 0;
        }
        if (!options.scrollY) {
            newY = 0;
        }


        //到达边缘，减速或停止移动
        if (newX < params.minScrollX || newX > params.maxScrollX) {
            params.overflowX += e.movementX;
            if (options.bounce) {
                newX = (newX < params.minScrollX ? params.minScrollX : params.maxScrollX) + rubberBanding(params.overflowX, options.width);
            } else {
                newX = (newX < params.minScrollX) ? params.minScrollX : params.maxScrollX;
            }
        }

        if (newY < params.minScrollY || newY > params.maxScrollY) {
            params.overflowY += e.movementY;
            if (options.bounce) {
                newY = (newY < params.minScrollY ? params.minScrollY : params.maxScrollY) + rubberBanding(params.overflowY, options.height);
            } else {
                newY = (newY < params.minScrollY) ? params.minScrollY : params.maxScrollY;
            }
        }

        params.x = newX;
        params.y = newY;

        this.trigger('scrolling');
    }

    _endScroll(e) {
        //不能滚动，直接返回
        let params = this._params;
        if (!params.scroll) {
            return;
        }

        params.scrolling = false;
    }

    _resetPosition(time = 0, easing = Ease.bounce) {

    }

    _scrollTo(x, y, time = 0, easing = Ease.bounce) {

    }

    _animate(destX, destY, duration, easingFn) {

    }

    _stop() {

    }

    render(){
        this._painter.renderAll();
    }
}

export default SXRender;