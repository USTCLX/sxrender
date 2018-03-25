/**
 * Created by lixiang on 2018/3/23.
 */

import EventDispatcher from './EventDispatcher'
import Painter from '../painter/painter';
import Storage from '../storage/storage';
import {BaseType, checkType, eventUtil, extend, getNow} from "../utils/utils";


const DEFAULT_OPTIONS = {
    width: 500,
    height: 500,
    contentWidth: 500,
    contentHeight: 500,
    scrollX: false,
    scrollY: true,
    backgroundColor: '',
    backgroundImage: '',
    scrollBar: false,
    disableTouch: true,
    disableMouse: false,
    preventDefault: true,
    stopPropagation: true,
    momentumLimitTime: 300,
    momentumLimitDistance: 15
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
        this._handleInit();

        return this;
    }

    _handleOptions(opts) {
        this.options = extend({}, DEFAULT_OPTIONS, opts);
        this.options.scrollX = (this.options.contentWidth > this.options.width) ? this.options.scrollX : false;
        this.options.scrollY = (this.options.contentHeight > this.options.height) ? this.options.scrollY : false;

    }

    _handleElements(id) {
        this._wrapperEle = document.getElementById(id);
        this._canvasEle = document.createElement("canvas");
        this._bgCanvasEle = document.createElement("canvas");

        this._wrapperEle.style.position = "relative";
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

    _handleInit() {

        this._storage = new Storage();
        this._painter = new Painter(this._canvasEle, this._bgCanvasEle, this._storage);

        this.x = 0;
        this.y = 0;
        this.distX = 0;
        this.distY = 0;
        this.pointX = 0;
        this.pointY = 0;
        this.startX = 0;
        this.startY = 0;
        this.scroll = this.options.scrollX||this.options.scrollY;

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
        eventUtil(e, this);

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
        this.pointX = e.pageX;
        this.pointY = e.pageY;

        this.distX = 0;
        this.distY = 0;

        this.startTime = getNow();

        this.trigger('beforeScrollStart');
    }

    _moveScroll(e) {

    }

    _endScroll(e) {

    }

    _stop() {

    }
}

export default SXRender;