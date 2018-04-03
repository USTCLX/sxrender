import Animation from './Animation';
import {stateTypes} from "./common";
import requestAnimationFrame from './requestAnimationFrame';
import {BaseType,checkType,deepClone} from "../utils/utils"

/**
 * 根据阻尼系数，弹力系数，初始速度，初始位置信息，计算出进度p关于时间t的函数
 * @param  {num} damping         阻尼系数
 * @param  {num} stiffness       弹力系数
 * @param  {num} initialVelocity 初始速度
 * @param  {num} startX          初始位置
 * @return {fun}                 p关于t的函数
 *
 */
const calTimingFunctionBySpring = function (damping, stiffness, initialVelocity, startX) {
    var c = damping;
    var k = stiffness;
    var v = initialVelocity;
    var t = c * c - 4 * k;
    var r1, r2;
    var alpha, beta;
    var f0;
    var fp0;
    f0 = startX;
    fp0 = v;
    var C1, C2;
    if (t > 0) {
        t = Math.sqrt(t);
        r1 = (-c + t) * 0.5;
        r2 = (-c - t) * 0.5;

        C1 = (fp0 - r2 * f0) / (r1 - r2);
        C2 = (fp0 - r1 * f0) / (r2 - r1);
        return function (t) {
            return C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t) + 1;
        }
    } else if (t == 0) {
        r1 = -c * 0.5;
        C1 = f0;
        C2 = fp0 - C1 * r1;
        return function (t) {
            return (C1 + C2 * t) * Math.exp(r1 * t) + 1;
        }

    } else {
        t = Math.sqrt(-t);
        alpha = -c * 0.5;
        beta = t * 0.5;

        C1 = f0;
        C2 = (fp0 - alpha * f0) / beta;
        return function (t) {
            return (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t)) * Math.exp(alpha * t) + 1;
        }
    }
};

/**
 * initialVelocity 初始速度
 * damping 阻尼系数,一般为12 系统中采用26
 * stiffness 弹力系数,一般为180 系统中采用170
 * duration 弹跳动画持续时间，一般为2000ms
 */

//todo:目前startValue和stopValue支持对象，也支持两个方向，但是v仍然只支持单方向的速度，需要加入双向速度支持
let SpringAnimation = function (target, key, initialVelocity, damping, stiffness, startValue, stopValue, duration, opts) {
    Animation.apply(this, [target, key, startValue, stopValue, duration]);
    this.initialVelocity = initialVelocity || 0;
    this.damping = opts && opts.damping || 26;
    this.stiffness = opts && opts.stiffness || 170;
    this.startX = -1;//初始化为-1  平衡位置为0
    this.bounceLimit = opts && opts.bounceLimit || 100;

    if(checkType(startValue)!==checkType(stopValue)){
        throw new Error('start and stop must have same type!');
        return;
    }

    //预处理
    if ((startValue instanceof Object) && (stopValue instanceof Object)) {
        this.startX = {};
        this.timingFun = {};
        for (let key in stopValue) {
            if (startValue.hasOwnProperty(key) && stopValue.hasOwnProperty(key)) {
                this.startX[key] = (stopValue[key] - startValue[key]) / this.bounceLimit;
                this.timingFun[key] = calTimingFunctionBySpring(this.damping, this.stiffness, this.initialVelocity, this.startX[key]);
            }
        }

    } else if ((startValue instanceof Number) && (stopValue instanceof Number)) {
        this.startX = (stopValue - startValue) / this.bounceLimit;
        this.timingFun[key] = calTimingFunctionBySpring(this.damping, this.stiffness, this.initialVelocity, this.startX);
    } else {
        //类型不支持
        throw new Error('type err in SpringAnimation!');
    }


};
//继承Animation
SpringAnimation.prototype = Object.create(Animation.prototype);

const springAnimateHandler = function () {
    if (this.state.stateType !== stateTypes.running) {
        return;
    }

    let start = this.bounceLimit;
    let stop = 0;

    if (this.state.curValue instanceof Object) {
        for (let key in this.state.curValue) {
            if (this.state.curValue.hasOwnProperty(key)) {
                if (this.startValue[key] === this.stopValue[key]) {
                    this.state.curValue[key] = this.stopValue[key];
                } else {
                    this._p = this.timingFun[key](this.state.curFrame / this._totalFrames);
                    this.state.curValue[key] = this._interpolateValue(this.bounceLimit, 0, this._p) + this.stopValue[key];
                }

            }
        }
    } else if (this.state.curValue instanceof Number) {
        if(this.startValue === this.stopValue){
            this.state.curValue = this.stopValue;
        }else{
            this._p = this.timingFun(this.state.curFrame / this._totalFrames);
            this.state.curValue = this._interpolateValue(start, stop, this._p) + this.stopValue;
        }

    }


    if (this.target && this.key) {
        this._changeTargetValue();
    }

    this.onFrameCB && this.onFrameCB();

    this.lastState = deepClone(this.state);
    this._lastTimeStamp = Date.now();

    if (this.state.curFrame < this._totalFrames) {
        requestAnimationFrame(springAnimateHandler.bind(this), this._timeStep);
    } else {
        this.state.curValue = this.stopValue;
        this._changeTargetValue();
        this.stop();
    }
    this.state.curFrame++;
};

Object.assign(SpringAnimation.prototype, {
    constructor: SpringAnimation,
    start: function () {
        if (this.state.stateType !== stateTypes.idle) {
            return;
        }
        this.state.stateType = stateTypes.running;
        setTimeout(function () {
            this.didStartCB && this.didStartCB();
            this._timeStamp = Date.now();
            requestAnimationFrame(springAnimateHandler.bind(this), this._timeStep);
        }.bind(this), this.startDelay);
    }
});

export default SpringAnimation;