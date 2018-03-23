/**
 * Created by lixiang on 2018/3/23.
 */

import EventDispatcher from './EventDispatcher'
import Painter from '../painter/painter';
import Storage from '../storage/storage';
import {BaseType, checkType, mixin, extend} from "../utils/utils";


const DEFAULT_OPTIONS = {
    width: 500,
    height: 500,
    contentWidth: 500,
    contentHeight: 500,
    scrollX: false,
    scrollY: true,
    x: 0,
    y: 0,
    pointX: 0,
    pointY: 0,
    startX: 0,
    startY: 0,
    backgroundColor: '',
    backgroundImage: '',
    scrollBar: false

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
        this._handleEvents();
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

        this._canvasEle.style.position = "absolute";
        this._canvasEle.style.width = this.options.width;
        this._canvasEle.style.height = this.options.height;

        this._bgCanvasEle.style.position = "absolute";
        this._bgCanvasEle.style.width = this.options.width;
        this._bgCanvasEle.style.height = this.options.height;
    }

    _handleEvents(){
        this._canvasEle.addEventListener("click",this,false);
    }

    _handleInit() {

        this._storage = new Storage();
        this._painter = new Painter(this._canvasEle, this._bgCanvasEle, this._storage);

        let bgColor = this.options.backgroundColor;
        let bgImage = this.options.backgroundImage;

        if (!!bgColor && (checkType(bgColor) === BaseType.String)) {
            this._bgCanvasEle.style.backgroundColor = bgColor;
        }

        if (!!bgImage && (checkType(bgImage) === BaseType.String)) {
            this._bgCanvasEle.style.background = bgImage;
        }
    }
}