/**
 * Created by lixiang on 2018/3/23.
 */
import Painter from '../painter/painter';
import Storage from '../storage/storage';
import {BaseType,checkType,extend} from "../utils/utils"


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
};

//scroll 的默认参数
const DEFAULT_PARAMS = {
    x: 0,
    y: 0,
    distX: 0, //鼠标按下后，移动的绝对距离
    distY: 0,
    pointX: 0, //鼠标按下的点，相对于page,并在移动时更新
    pointY: 0,
    startX: 0, //移动的开始位置
    startY: 0,
    scroll: false,//是否可以滚动，
    scrollX: false,//是否可以沿X轴滚动
    scrollY: false,//是否可以沿Y轴滚动
    scrolling: false,//是否正在scroll中
    maxScrollX: 0,
    minScrollX: 0,
    maxScrollY: 0,
    minScrollY: 0,
    overflowX: 0,//开启bounce时，超出的长度
    overflowY: 0,
    animateTimer: null,  //动画的引用
    isAnimating: false,  //是否正在动画
    startTime: 0,
    endTime: 0
};

const Init = {
    _handleOptions: function (opts) {
        if (opts.contentWidth === undefined || opts.contentWidth < opts.width) {
            opts.contentWidth = opts.width;
        }

        if (opts.contentHeight === undefined || opts.contentHeight < opts.height) {
            opts.contentHeight = opts.height;
        }

        this.options = extend({}, DEFAULT_OPTIONS, opts);
    },

    _handleElements: function (id) {
        this._rootEle = document.getElementById(id);

        this._wrapperEle = document.createElement("div");
        this._canvasEle = document.createElement("canvas");
        this._bgCanvasEle = document.createElement("canvas");

        this._wrapperEle.style.position = "relative";
        this._wrapperEle.style.margin = "auto";
        this._wrapperEle.style.width = this.options.width + "px";
        this._wrapperEle.style.height = this.options.height + "px";

        this._canvasEle.style.position = "absolute";
        this._canvasEle.width = this.options.width;
        this._canvasEle.height = this.options.height;

        this._bgCanvasEle.style.position = "absolute";
        this._bgCanvasEle.width = this.options.width;
        this._bgCanvasEle.height = this.options.height;

        this._wrapperEle.appendChild(this._bgCanvasEle);
        this._wrapperEle.appendChild(this._canvasEle);

        this._rootEle.appendChild(this._wrapperEle);
    },

    _handleDomEvents: function () {
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
    },

    _handleCustomEvents: function () {
    },

    _handleInit: function () {
        this._params = extend({}, DEFAULT_PARAMS);
        this._storage = new Storage();
        this._painter = new Painter(this._canvasEle, this._bgCanvasEle, this._storage, this._params, this.options);

        this._params.scrollX = (this.options.contentWidth > this.options.width) ? true : false;
        this._params.scrollY = (this.options.contentHeight > this.options.height) ? true : false;
        this._params.scroll = this._params.scrollX || this._params.scrollY;
        this._params.minScrollX = this.options.width - this.options.contentWidth;
        this._params.minScrollY = this.options.height - this.options.contentHeight;

        let bgColor = this.options.backgroundColor;
        let bgImage = this.options.backgroundImage;

        if (!!bgColor && (checkType(bgColor) === BaseType.String)) {
            this._bgCanvasEle.style.backgroundColor = bgColor;
        }

        if (!!bgImage && (checkType(bgImage) === BaseType.String)) {
            this._bgCanvasEle.style.background = bgImage;
        }

        this._painter.renderAll();
    }
};

export default Init;