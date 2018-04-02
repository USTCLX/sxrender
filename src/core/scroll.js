//create by lixiang in 2018/3/28

import {Animation, SpringAnimation} from '../Animation';
import {getNow, rubberBanding, Ease} from "../utils/utils";

const Scroll = {
    /**
     * 开始滚动事件
     * 鼠标按下，手指按下时触发
     * @param e
     * @private
     */
    _startScroll: function (e) {
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
    },

    /**
     * 正在滚动事件
     * 鼠标在画布上移动时触发
     * @param e
     * @private
     */
    _moveScroll: function (e) {
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
            params.startX = params.x;
            params.startY = params.y;
        }

        this._translate(newX, newY);
    },

    /**
     * 结束滚动事件
     * 鼠标抬起时触发
     * @param e
     * @private
     */
    _endScroll: function (e) {
        let params = this._params;
        let options = this.options;

        let newX = Math.round(params.x);
        let newY = Math.round(params.y);
        let time;
        let easing = Ease.swipe;

        //不能滚动或者不处于滚动中，直接返回
        if (!params.scroll || !params.scrolling) {
            return;
        }
        params.scrolling = false;

        //如果超出边界，就重置位置，并且重置结束后直接返回，不用执行动量动画
        if (this._resetPosition(options.bounceTime, Ease.spring)) {
            return;
        }

        params.endTime = getNow();

        let duration = params.endTime - params.startTime;
        let absDistX = Math.abs(newX - params.startX);
        let absDistY = Math.abs(newY - params.startY);

        //开启动量动画，并且按住的持续之间小于300，并且移动距离大于15，认为是滚动状态，否则认为是静止状态，不需要开启动画
        if (options.momentum && (duration < options.momentumLimitTime) && (absDistX > options.momentumLimitDistance || absDistY > options.momentumLimitDistance)) {
            let momentumX = this._momentum(newX, params.startX, duration, params.minScrollX, params.maxScrollX);
            let momentumY = this._momentum(newY, params.startY, duration, params.minScrollY, params.maxScrollY);
            newX = momentumX.destination;
            newY = momentumY.destination;
            time = Math.max(momentumX.duration, momentumY.duration);
        }

        if (newX !== params.x || newY !== params.y) {
            this._scrollTo(newX, newY, time, easing)
        }

    }


    ,

    /**
     * 使用bounce效果，将内容重新滚动回边界位置。
     * 如果超出边界，返回true，并执行bounce动画
     * 如果未超出边界，返回false，什么都不做
     * @param time  动画持续时间
     * @param easing 时间函数
     * @returns {boolean}
     * @private
     */
    _resetPosition: function (time = 0, easing = Ease.bounce) {
        let params = this._params;
        let x, y;

        x = params.x;
        y = params.y;

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
    },

    /**
     * 将内容自动滚动到某处
     * @param x
     * @param y
     * @param time
     * @param easing
     * @private
     */
    _scrollTo: function (x, y, time = 0, easing = Ease.bounce) {
        //将内容移动到某处，使用动画效果,只能使用js动画
        this._scrollAnimate(x, y, time, easing);
    },

    /**
     * 开启动画动画
     * @param destX  目标位置
     * @param destY
     * @param duration 持续时间
     * @param easingFn
     * @private
     */
    _scrollAnimate: function (destX, destY, duration, easingFn, opts) {
        let params = this._params;
        let options = this.options;
        let self = this;

        if (easingFn === Ease.spring) {
            let v = (opts && opts.v) || 0;
            params.animateTimer = new SpringAnimation(params, ['x', 'y', 'overflowX', 'overflowY'], v, 26, 170, {
                x: params.x,
                y: params.y,
                overflowX: params.overflowX,
                overflowY: params.overflowY
            }, {
                x: destX,
                y: destY,
                overflowX: 0,
                overflowY: 0
            }, duration);
            params.animateTimer.didStartCB = function () {
                params.isAnimating = true;
            };
            params.animateTimer.onFrameCB = function () {
                self._render();

            };
            params.animateTimer.didStopCB = function () {
                params.isAnimating = false;
                params.animateTimer = null;
            };
            params.animateTimer.start();

        } else if (easingFn === Ease.swipe) {
            params.animateTimer = new Animation(params, ['x', 'y'], {x: params.x, y: params.y}, {
                x: destX,
                y: destY
            }, duration, {timingFun: easingFn.fn});
            params.animateTimer.didStartCB = function () {
                params.isAnimating = true;
            };
            params.animateTimer.onFrameCB = function () {
                self._render();
                //计算是否触碰边界
                let {x, y} = this.state.curValue;
                let {maxScrollX, minScrollX, maxScrollY, minScrollY} = params;
                let vx = 0, vy = 0;
                console.log('laststate',this.lastState.curValue.y);
                if (x > maxScrollX || x < minScrollX) {
                    let lx = this.lastState.curValue.x;
                    vx = (x - lx) / (getNow() - this._lastTimeStamp) * 1000;
                }
                if (y > maxScrollY || y < minScrollY) {
                    let ly = this.lastState.curValue.y;
                    console.log(y - ly,getNow() - this._lastTimeStamp);
                    vy = (y - ly) / (getNow() - this._lastTimeStamp) * 1000;
                }
                if (!!vx || !!vy) {
                    //over boundary
                    let absVX = Math.abs(vx);
                    let absVY = Math.abs(vy);
                    let v = vy;

                    this.stop(); //停止当前动画
                    let destX = x > minScrollX ? minScrollX : maxScrollX;
                    let destY = y > minScrollY ? minScrollY : maxScrollY;
                    console.log('destX',destX,destY,vy);
                    self._scrollAnimate(destX, destY, options.bounceTime, Ease.spring, {v: v})
                }

            };
            params.animateTimer.didStopCB = function () {
                params.isAnimating = false;
                params.animateTimer = null;
            };
            params.animateTimer.start();

        }

    },

    /**
     * 停止滚动
     * 一些参数重置，与回收
     * @private
     */
    _stopScroll: function () {
        let {animateTimer} = this._params;

        animateTimer && animateTimer.stop();
    },

    /**
     * 将内容变换到某处，随即自动渲染
     * @param newX
     * @param newY
     * @private
     */
    _translate: function (newX, newY) {
        let params = this._params;
        params.x = newX;
        params.y = newY;

        this._render();
    },

    /**
     * 计算动量运动后的位置，设置动量动画的持续时间
     * @param current  当前位置
     * @param start    开始位置
     * @param time     持续时间
     * @param opts
     */
    _momentum: function (current, start, time, minScroll, maxScroll) {
        let {swipeBounceTime, swipeTime, bounce} = this.options;
        let distance = current - start;
        let speed = distance * 1000 * 0.8 / time;  //速度以秒为单位，并且衰减一点
        let destination = current + speed;
        let duration = swipeTime;

        if (destination > maxScroll || destination < minScroll) {
            if (bounce) {

            } else {
                destination = (destination > maxScroll) ? maxScroll : minScroll;
                duration = swipeBounceTime;
            }
        }

        return {
            destination: Math.round(destination),
            duration: duration
        }

    }
};

export default Scroll;

