/**
 * Created by lixiang on 2018/1/8.
 */

import requestAnimationFrame from './requestAnimationFrame';
import {timingFunctions, stateTypes, valueTypes, State, interpolateNumber, interpolateObject} from "./common"
import {BaseType, checkType, deepClone} from '../utils/utils';


let Animation = function (target, key, startValue, stopValue, duration, opts) {
    opts = opts || {};

    this.target = target;
    this.key = key;
    this.startValue = startValue;
    this.stopValue = stopValue;
    this.duration = duration;

    this.fps = opts.fps || 60;
    this.startDelay = opts.startDelay || 0;
    this.autoReverse = opts.autoReverse || false;
    this.repeatCount = opts.repeatCount || 1;
    this.appliedOnCompletion = opts.appliedOnCompletion || function () {
    };
    this.timingFun = opts.timingFun || timingFunctions.linear; //必须是个函数

    this.state = new State();
    this.lastState = null;

    //event
    this.didStartCB = opts.didStartCB || function () {
    };
    this.onFrameCB = opts.onFrameCB || function () {
    };
    this.didPauseCB = opts.didPauseCB || function () {
    };
    this.didStopCB = opts.didStopCB || function () {
    };

    //private
    this._p = 0;                 //进度
    this._totalFrames = 0;       //总帧数
    this._timeStep = 0;          //定时器间隔
    this._timeStamp = 0;         //开始动画事件戳
    this._lastTimeStamp = 0;     //动画帧时间戳
    this._valueType = valueTypes.number;

    this.init();
};

const coreAnimateHandler = function () {
    if (this.state.stateType !== stateTypes.running) {
        return;
    }

    this._p = this.timingFun(this.state.curFrame / this._totalFrames);

    this.state.curValue = this._interpolateValue(this.startValue,this.stopValue,this._p);

    if (this.target && this.key) {
        this._changeTargetValue();
    }

    this.onFrameCB && this.onFrameCB();

    this.lastState = deepClone(this.state);
    this._lastTimeStamp = Date.now();


    if (this.state.curFrame < this._totalFrames) {
        //执行动画
        requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
    } else if (this.autoReverse && !this.state.resveringeState) {
        //自动回溯
        this.state.resveringeState = true;
        this.state.curFrame = 0;
        requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
    } else if (this.state.repeat < (this.repeatCount - 1)) {
        //重复动画
        this.state.repeat++;
        this.state.curFrame = 0;
        this.state.resveringeState = false;
        requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
    } else {
        this.state.curValue = this.stopValue;
        this._changeTargetValue();
        this.stop();
    }

    this.state.curFrame++;
};

Animation.prototype = {
    constructor: Animation,
    init: function () {
        //计算总帧数
        this._totalFrames = this.duration / 1000 * this.fps;
        //计算定时器间隔
        this._timeStep = Math.round(1000 / this.fps);
        //判断valueType
        switch (typeof this.startValue) {
            case 'object':
                this._valueType = valueTypes.object;
                break;
            case 'number':
                this._valueType = valueTypes.number;
                break;
            default:
                break
        }
        //state curValue
        this.state.curValue = deepClone(this.startValue);
    },
    start: function () {
        if (this.state.stateType !== stateTypes.idle) {
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function () {
            this.didStartCB && this.didStartCB();
            this._lastTimeStamp = Date.now();
            this.lastState = deepClone(this.state);
            requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
        }.bind(this), this.startDelay);

    },
    stop: function () {
        //reset
        this.state.stateType = stateTypes.idle;
        this.state.curValue = 0;
        this.state.curFrame = 0;
        this.state.repeat = 0;
        this.state.resveringeState = false;

        this.didStopCB && this.didStopCB();
    },
    pause: function () {
        if (this.state.stateType === stateTypes.running) {
            this.state.stateType = stateTypes.paused;
            this.didPauseCB && this.didPauseCB();
        }
    },
    resume: function () {
        if (this.state.stateType === stateTypes.paused) {
            this.state.stateType = stateTypes.running;
            requestAnimationFrame(coreAnimateHandler.bind(this), this._timeStep);
        }
    },
    _changeTargetValue() {
        var state = this.state;
        var key = this.key;
        var target = this.target;
        if ((key instanceof String) && (state.curValue.hasOwnProperty(this.key))) {

            target[key] = state.curValue;

        } else if ((key instanceof Array)) {

            key.forEach(function (item) {
                if (state.curValue.hasOwnProperty(item) && target.hasOwnProperty(item)) {
                    target[item] = state.curValue[item];
                }
            })

        }

    },
    _interpolateValue(startValue, stopValue, factor) {
        var type = checkType(startValue);
        var self = this;
        switch (type) {
            case BaseType.Array:
                return startValue.map(function (sv, i) {
                    return self._interpolateValue(sv, stopValue[i], factor);
                });
            case BaseType.Object:
                var obj = {};
                for (var key in startValue) {
                    if (startValue.hasOwnProperty(key)) {
                        obj[key] = this._interpolateValue(startValue[key], stopValue[key], factor);
                    }
                }
                return obj;
            case BaseType.Number:
                return Math.round(startValue + factor * (stopValue - startValue));
            default:
                console.error('not match type in interpolate value');
                break;
        }
    }
};

// test for api
// var now = Date.now();
// var animator = new Animation(null,'',0,100,1000,{repeatCount:2,autoReverse:true,fps:30});
// animator.onFrameCB = function () {
//     console.log(this.state.curValue);
//     if(this.state.curFrame===15){
//         animator.pause();
//         setTimeout(function(){
//             console.log('resume');
//             animator.resume();
//         },500)
//     }
//
// };
// animator.start();
// animator.didStopCB = function(){
//     console.log('elapsed',Date.now()-now,'start');
// };

export default Animation;

