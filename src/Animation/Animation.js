/**
 * Created by lixiang on 2018/1/8.
 */

import requestAnimationFrame from './requestAnimationFrame';
import {timingFunctions,stateTypes,State,interpolateNumber,interpolateObject} from "./common"




let Animation = function(target,key,startValue,stopValue,duration,opts){
    opts = opts||{};

    this.target = target;
    this.key = key;
    this.startValue = startValue;
    this.stopValue = stopValue;
    this.duration = duration;

    this.fps = opts.fps||60;
    this.startDelay = opts.startDelay||0;
    this.autoReverse = opts.autoReverse||false;
    this.repeatCount = opts.repeatCount||1;
    this.appliedOnCompletion = opts.appliedOnCompletion||function(){};
    this.timingFun = opts.timingFun||timingFunctions.linear; //必须是个函数

    this.state = new State();
    this.lastState = null;

    //event
    this.didStartCB = opts.didStartCB||function(){};
    this.onFrameCB = opts.onFrameCB||function(){};
    this.didPauseCB = opts.didPauseCB||function(){};
    this.didStopCB = opts.didStopCB||function(){};

    //private
    this._p = 0;           //进度
    this._totalFrames = 0; //总帧数
    this._timeStep = 0;    //定时器间隔
    this._timeStamp = 0;   //开始动画时间戳

    this.init();
};

const coreAnimateHandler = function(){
    if(this.state.stateType!==stateTypes.running){
        return;
    }

    this._p = this.timingFun(this.state.curFrame/this._totalFrames);
    this.state.curValue = (typeof this.startValue!=='object')?interpolateNumber(this.startValue,this.stopValue,this._p):interpolateObject(this.startValue,this.stopValue,this._p);

    if(this.target.hasOwnProperty(this.key)){
        this.target[this.key] = this.state.curValue;
    }

    this.onFrameCB&&this.onFrameCB();
    if(this.state.curFrame<this._totalFrames){
        requestAnimationFrame(coreAnimateHandler.bind(this),this._timeStep);
    }else{
        this.stop();
    }

    this.state.curFrame++;
};

Animation.prototype = {
    constructor:Animation,
    init:function(){
        //计算总帧数
        this._totalFrames = this.duration/1000*this.fps;
        //计算定时器间隔
        this._timeStep = Math.round(1/this.fps);
    },
    start:function(){
        if(this.state.stateType!==stateTypes.idle){
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function(){
            this.didStartCB&&this.didStartCB();
            requestAnimationFrame(coreAnimateHandler.bind(this),this._timeStep);
        }.bind(this),this.startDelay);

    },
    stop:function(){
        this.state.stateType = stateTypes.idle;
        this.state.curValue = 0;
        this.state.curFrame = 0;
        this._totalFrames = 0;
        this.didStopCB&&this.didStopCB();
    },
    pause:function(){
        if(this.state.stateType===stateTypes.running){
            this.state.stateType = stateTypes.paused;
            this.didPauseCB&&this.didPauseCB();
        }
    },
    resume:function(){
        if(this.state.stateType===stateTypes.paused){
            this.state.stateTypes = stateTypes.running;
            requestAnimationFrame(coreAnimateHandler.bind(this),this._timeStep);
        }
    }
};






export default Animation;

