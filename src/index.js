/**
 * Created by lixiang on 2018/1/7.
 */

import * as Utils from './utils/utils';
import {InertialAnimation, SpringAnimation} from './Animation';
import GraphInterface from './Graph';
import Storage from './storage/storage';
import Painter from './painter/painter';


/**
 * SXRender类
 * @param {String} id
 * @param {Number} width
 * @param {Number} height
 * @param {Number} contentWidth
 * @param {Number} contentHeight
 * @param {String} backgroundColor
 * @param {String/Object} backgroundImage
 * @param {Boolean} drawScrollBar
 */
class SXRender2 {
    constructor(opts) {
        //basic attrs
        this.id = opts.id||'';
        this.width = opts.width||0;
        this.height = opts.height||0;
        this.contentWidth = opts.contentWidth||this.width;
        this.contentHeight = opts.contentHeight||this.height;
        this.backgroundColor = opts.backgroundColor||'';
        this.backgroundImage = opts.backgroundImage||'';
        this.drawScrollBar = opts.drawScrollBar||false;

        //private attrs
        this._canvas = null;
        this._ctx = null;
        this._backgroundCanvas = null;
        this._backgroundCtx = null;
        
        this._scrollVEnabled = false;
        this._scrollHEnabled = false;
    }

}

let SXRender = function (opts) {
    var canvas, ctx, id, w, h, bgColor, contentW, contentH, drawScrollBar;
    opts = opts || {};

    id = opts.id || '';
    w = opts.width;
    h = opts.height;
    bgColor = opts.backgroundColor || '';
    contentW = opts.contentWidth || w;
    contentH = opts.contentHeight || h;
    drawScrollBar = opts.drawScrollBar || false;

    canvas = (!!id) ? document.getElementById(id) : document.createElement("canvas");
    canvas.style.backgroundColor = (!!bgColor) ? bgColor : 'rgba(0,0,0,0)';
    canvas.width = w || 500;
    canvas.height = h || 500;

    ctx = canvas.getContext("2d");

    this.init(canvas, ctx, contentW, contentH, drawScrollBar);

};

SXRender.prototype = {
    constructor: SXRender,
    init: function (canvas, ctx, contentW, contentH, drawScrollBar) {
        //canvas
        this.canvas = canvas;
        this.ctx = ctx;

        //basic attrs
        this.width = canvas.width;
        this.height = canvas.height;
        this.dragging = false;        //drag一个物体
        this.scratching = false;     //抓住背景，可拖动内容整体滚动
        this.selectObjId = 0;
        this.contentW = contentW;    //内容宽度
        this.contentH = contentH;    //内容高度
        this.drawScrollBar = drawScrollBar;
        this.backgroundImg = {};
        this.scrollVEnabled = !!(this.contentH && this.contentH > this.height);
        this.scrollHEnabled = !!(this.contentW && this.contentW > this.width);
        this.limitX = {
            min: this.width - this.contentW,
            max: 0
        };
        this.limitY = {
            min: this.height - this.contentH,
            max: 0
        };

        this.mouseDownPos = {
            x: 0,
            y: 0
        };
        this.springOffset = {
            x: 0,                     //X方向偏移，用于橡皮擦扒的效果。
            y: 0                      //Y方向偏移，用于橡皮擦扒的效果。
        };
        this.contentOffset = {
            x: 0,
            y: 0                      //内容的偏移
        };

        //objs list
        this.objects = [];
        this.storage = new Storage();

        //painter
        this.painter = new Painter(this.canvas, this.ctx, null, null, this.storage);

        //animation
        this._animation = null;     //动画
        this._contentVelcoity = {   //内容滚动的速度
            y: 0,
            x: 0
        };
        this._frame = {             //保存旧的鼠标坐标,用于获取速度
            x: 0,
            y: 0,
        };
        this._ticker = null;        //内部定时器,用于捕获速度
        this._timeStamp = 0;        //保存上次move的时刻的时间戳


        //events
        this.canvas.addEventListener('mousedown', mouseDownHandler.bind(this), false);
        this.canvas.addEventListener('mouseup', mouseUpHandler.bind(this), false);
        this.canvas.addEventListener('mousemove', mouseMoveHandler.bind(this), false);
        this.canvas.addEventListener('mouseout', mouseUpHandler.bind(this), false);
    },
    //绘制画板背景
    drawBackground: function (opts) {
        if (!!opts) {
            this.backgroundImg.content = opts.imgObj;
            this.backgroundImg.sx = opts.sx || 0;
            this.backgroundImg.sy = opts.sy || 0;
            this.backgroundImg.sw = opts.sw || 0;
            this.backgroundImg.sh = opts.sh || 0;
            this.backgroundImg.dx = opts.dx || 0;
            this.backgroundImg.dy = opts.dy || 0;
            this.backgroundImg.dw = opts.dw || this.width;
            this.backgroundImg.dh = opts.dh || this.height;
        }

        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (!this.backgroundImg.content) {
            return;
        }
        if (this.backgroundImg.sw && this.backgroundImg.sh) {
            this.ctx.drawImage(this.backgroundImg.content, this.backgroundImg.sx, this.backgroundImg.sy, this.backgroundImg.sw, this.backgroundImg.sh, this.backgroundImg.dx, this.backgroundImg.dy, this.backgroundImg.dw, this.backgroundImg.dh);

        } else {
            this.ctx.drawImage(this.backgroundImg.content, this.backgroundImg.dx, this.backgroundImg.dy, this.backgroundImg.dw, this.backgroundImg.dh);
        }
        this.ctx.restore();
    },
    //重新绘制
    render: function () {
        this.backgroundImg.content ? this.drawBackground() : null;
        this.ctx.setTransform(1, 0, 0, 1, this.contentOffset.x + this.springOffset.x, this.contentOffset.y + this.springOffset.y);
        this.painter.renderAll();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.scrollHEnabled || this.scrollVEnabled && this.drawScrollBar) {
            this.drawProgress();
        }
    },
    //将绘图实例添加至画布并渲染。
    add: function (obj) {
        this.storage.addObj(obj);
        this.render();
    },
    /**
     * 绘制滚动条
     * @private
     */
    drawProgress: function () {
        var top, left, width, height, offset;

        if (this.scrollVEnabled) {
            width = 4;
            height = Math.round((this.height * this.height) / this.contentH) - Math.abs(this.springOffset.y);
            height = (height < 10) ? 10 : height;
            offset = (this.springOffset.y < 0) ? this.springOffset.y : 0;
            top = Math.round((-this.contentOffset.y * (this.height)) / this.contentH) - offset;
            top = top > (this.height - 10) ? (this.height - 10) : top;
            left = this.width - width;

            this.ctx.save();
            this.ctx.fillStyle = '#888888';
            this.ctx.fillRect(left, top, width, height);
            this.ctx.restore();
        }

        if (this.scrollHEnabled) {
            width = Math.round((this.width * this.width) / this.contentW) - Math.abs(this.springOffset.x);
            width = (width < 10) ? 10 : width;
            height = 4;

            top = this.height - height;
            offset = (this.springOffset.x < 0) ? this.springOffset.x : 0;
            left = Math.round((-this.contentOffset.x * (this.width)) / this.contentW) - offset;
            this.ctx.save();
            this.ctx.fillStyle = '#888888';
            this.ctx.fillRect(left, top, width, height);
            this.ctx.restore();
        }

    }
};

Utils.mixin(SXRender,GraphInterface,false);

/**
 * 鼠标按下事件。
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseDownHandler(e) {
    var pos = Utils.getRelativeRect(e);

    this.selectObjId = Utils.checkClickElm(this.storage.getAllObjects(), pos, this.contentOffset);
    this.mouseDownPos = pos;
    if (!!this.selectObjId) {
        //选中物体
        this.dragging = true;
    } else {
        //拖动界面
        this.scratching = true;

        this._animation ? this._animation.stop() : null;
        // clearInterval(this._animation); //清除动画
        clearInterval(this._ticker);

        this._contentVelcoity.y = 0;
        this._contentVelcoity.x = 0;

        //跟踪鼠标，获取速度，50ms获取一次
        if (this.scrollVEnabled || this.scrollHEnabled) {
            this._timeStamp = Date.now();
            this._frame.y = this.mouseDownPos.y;
            this._frame.x = this.mouseDownPos.x;
            this._ticker = setInterval(function () {
                var now, elapsed, delta, v;
                now = Date.now();
                elapsed = now - this._timeStamp;
                this._timeStamp = now;
                delta = this.mouseDownPos.y - this._frame.y;
                v = 1000 * delta / (1 + elapsed);
                this._contentVelcoity.y = 0.8 * v + 0.2 * this._contentVelcoity.y;
                delta = this.mouseDownPos.x - this._frame.x;
                v = 1000 * delta / (1 + elapsed);
                this._contentVelcoity.x = 0.8 * v + 0.2 * this._contentVelcoity.x;
                this._frame.y = this.mouseDownPos.y;
                this._frame.x = this.mouseDownPos.x;
            }.bind(this), 50);
        }
    }
}

/**
 * 鼠标抬起事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseUpHandler(e) {
    if (this.dragging) {
        this.dragging = false;
        this.selectObjId = 0;
    } else if (this.scratching) {
        //扒页面
        this.scratching = false;
        //清空速度计算的轮训
        clearInterval(this._ticker);

        if (this.scrollVEnabled || this.scrollHEnabled) {
            if (this.springOffset.y !== 0 || this.springOffset.x !== 0) {
                //开启弹跳动画
                var self = this;
                this._animation = new SpringAnimation(null, '', 0, 12, 180, this.springOffset, {x: 0, y: 0}, 800);
                this._animation.onFrameCB = function () {
                    self.springOffset = this.state.curValue;
                    self.render();
                };
                this._animation.start();
            } else {
                //开始惯性滚动
                var amplitude = {},
                    targetPos = {},
                    v = this._contentVelcoity;
                if (v.y > 30 || v.y < -30 || v.x > 30 || v.x < -30) {
                    amplitude.x = (v.x < -30 || v.x > 30) ? 0.8 * v.x : 0;
                    amplitude.y = (v.y < -30 || v.y > 30) ? 0.8 * v.y : 0;
                    targetPos.x = Math.round(this.contentOffset.x + amplitude.x);
                    targetPos.y = Math.round(this.contentOffset.y + amplitude.y);
                    //开启惯性滚动动画
                    var self = this;
                    this._animation = new InertialAnimation(null, '', this.contentOffset, targetPos, amplitude);
                    this._animation.onFrameCB = function () {
                        //检查是否越界
                        var c, vx = 0, vy = 0;               //碰撞到边缘时，x，y方向上的即时速度
                        self.contentOffset = this.state.curValue;
                        c = self.contentOffset;
                        if (c.x > self.limitX.max || c.x < self.limitX.min) {
                            c.x = (c.x > self.limitX.max) ? self.limitX.max : self.limitX.min;
                            vx = (this.state.curValue.x - this.lastState.curValue.x) / (Date.now() - this._lastTimeStamp) * 1000;
                            // this.stop();
                        }
                        if (c.y > self.limitY.max || c.y < self.limitY.min) {
                            c.y = (c.y > self.limitY.max) ? self.limitY.max : self.limitY.min;
                            vy = (this.state.curValue.y - this.lastState.curValue.y) / (Date.now() - this._lastTimeStamp) * 1000;
                            // this.stop();
                        }
                        self.render();
                        if (Math.abs(vx) > 50 || Math.abs(vy) > 50 && (!(vx && vy))) {
                            this.stop();
                            //需要开启spring弹簧动画,只有在单方向是开启
                            if (Math.abs(vy) > 50) {
                                self._animation = new SpringAnimation(null, '', vy, 20, 180, 0, 0, 800, 1);
                                self._animation.onFrameCB = function () {
                                    self.springOffset.y = this.state.curValue;
                                    self.render();
                                };
                                self._animation.didStopCB = function () {
                                    self.springOffset.y = this.state.curValue;
                                    self.render();
                                };
                                self._animation.start();
                            } else if (Math.abs(vx) > 50) {
                                self._animation = new SpringAnimation(null, '', vx, 20, 180, 0, 0, 2000, 1);
                                self._animation.onFrameCB = function () {
                                    self.springOffset.x = this.state.curValue;
                                    self.render();
                                };
                                self._animation.didStopCB = function () {
                                    self.springOffset.x = this.state.curValue;
                                    self.render();
                                };
                                self._animation.start();
                            }

                        }
                    };
                    this._animation.start();
                }
            }
        }
    }
}

/**
 * 鼠标移动事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseMoveHandler(e) {
    var dragging,
        selectObjId,
        selectObj,
        pos,              //鼠标点击在canvas内的位置
        diff = {x: 0, y: 0}; //鼠标位置间的差值

    pos = Utils.getRelativeRect(e);

    if (this.dragging) {
        //选中物体
        diff.x = pos.x - this.mouseDownPos.x;
        diff.y = pos.y - this.mouseDownPos.y;
        this.mouseDownPos.x = pos.x;
        this.mouseDownPos.y = pos.y;
        selectObj = this.storage.findById(this.selectObjId);
        selectObj.x += diff.x;
        selectObj.y += diff.y;
        this.render();

    } else if (this.scratching) {
        //扒动页面

        if (this.scrollVEnabled || this.scrollHEnabled) {
            diff.x = pos.x - this.mouseDownPos.x;
            diff.y = pos.y - this.mouseDownPos.y;
            if (this.scrollVEnabled) {
                if (diff.y < 0) {
                    //内容向上
                    if (this.contentOffset.y <= this.limitY.min) {
                        this.contentOffset.y = this.limitY.min;
                        //到达下边缘
                        this.springOffset.y = Utils.rubberBanding(diff.y, this.height);
                    } else {
                        this.mouseDownPos.y = pos.y;
                        this.contentOffset.y += diff.y;
                    }
                } else {
                    //内容向下
                    if (this.contentOffset.y >= this.limitY.max) {
                        //到达上边缘
                        this.contentOffset.y = this.limitY.max;
                        this.springOffset.y = Utils.rubberBanding(diff.y, this.height);
                    } else {
                        this.mouseDownPos.y = pos.y;
                        this.contentOffset.y += diff.y;
                    }
                }
            }

            if (this.scrollHEnabled) {
                if (diff.x < 0) {
                    //内容向左
                    if (this.contentOffset.x <= this.limitX.min) {
                        //到达左边缘
                        this.contentOffset.x = this.limitX.min;
                        this.springOffset.x = Utils.rubberBanding(diff.x, this.width);
                    } else {
                        this.mouseDownPos.x = pos.x;
                        this.contentOffset.x += diff.x;
                    }
                } else {
                    //内容向右
                    if (this.contentOffset.x >= this.limitX.max) {
                        //到达右边缘
                        this.contentOffset.x = this.limitX.max;
                        this.springOffset.x = Utils.rubberBanding(diff.x, this.width);
                    } else {
                        this.mouseDownPos.x = pos.x;
                        this.contentOffset.x += diff.x;
                    }
                }
            }
            this.render()
        }

    }
}

/**
 * 鼠标移除canvas事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function mouseOutHandler(e) {
    if (this.dragging) {
        this.dragging = false;
    }
    if (this.scratching) {
        this.scratching = false;
    }
    this.selectObjId = 0;
}

export default SXRender;
