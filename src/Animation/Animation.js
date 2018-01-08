/**
 * Created by lixiang on 2018/1/8.
 */

import requestAnimationFrame from './requestAnimationFrame';

/**
 * 时间曲线
 * @type {{linear: timingFunctions.linear, easeInQuad: timingFunctions.easeInQuad, easeOutQuad: timingFunctions.easeOutQuad, easeInOutQuad: timingFunctions.easeInOutQuad, easeInCubic: timingFunctions.easeInCubic, easeOutCubic: timingFunctions.easeOutCubic, easeInOutCubic: timingFunctions.easeInOutCubic, easeInQuart: timingFunctions.easeInQuart, easeOutQuart: timingFunctions.easeOutQuart, easeInOutQuart: timingFunctions.easeInOutQuart, easeInQuint: timingFunctions.easeInQuint, easeOutQuint: timingFunctions.easeOutQuint, easeInOutQuint: timingFunctions.easeInOutQuint, spring: timingFunctions.spring}}
 */
const timingFunctions = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },

    spring:function (t) {
        return -0.5 * Math.exp(-6*t)*(-2*Math.exp(6*t)+Math.sin(12*t)+2*Math.cos(12*t))
    }
};

//状态表
const stateTypes = {
    idle:'idle',
    running:'running',
    paused:'paused'
};

//状态构造器
function State(stateType,repeat,curFrame,curValue){
    this.stateType = stateType || stateTypes.idle;
    this.repeat = repeat || 0;
    this.curFrame = curFrame || 0;
    this.curValue = curValue;
}

//插值
function interpolateValue(startValue,stopValue,progress){
    return Math.round(startValue+progress*(stopValue-startValue));
}

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

    this.init();
};

const startHandler = function(){
    this._p = this.timingFun(this.state.curFrame/this._totalFrames);
    this.state.curValue = interpolateValue(this.startValue,this.stopValue,this._p);

    if(this.target.hasOwnProperty(this.key)){
        this.target[this.key] = this.state.curValue;
    }

    if(this.state.curFrame<this._totalFrames){
        requestAnimationFrame(startHandler.bind(this),this._timeStep);
    }else{
        this.stop();
    }

    this.state.curFrame++;
    this.onFrameCB&&this.onFrameCB();
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
        console.log('start...');
        if(this.state.stateType!==stateTypes.idle)
            return;

        this.state.stateType = stateTypes.running;


        setTimeout(function(){
            this.didStartCB&&this.didStartCB();
            requestAnimationFrame(startHandler.bind(this),this._timeStep);
        }.bind(this),this.startDelay);

    },
    stop:function(){
        this.state.stateType = stateTypes.idle;
        this.state.curValue = 0;
        this.state.curFrame = 0;
        this._totalFrames = 0;
    }
};


export default Animation;

