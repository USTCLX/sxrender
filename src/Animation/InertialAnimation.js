import Animation from './Animation';
import {stateTypes} from "./common"

//惯性滚动动画
let InertialAnimation = function(target,key,startValue,stopValue,amplitude,opts){
    Animation.apply(this,[target,key,startValue,stopValue,null,opts]);

    this._amplitude = amplitude;
    this.init();
};

const inertialStartHandler = function(){
    var elapsed = Date.now()-this._timeStamp;
    var state = this.state;

    if(this.state.stateType!==stateTypes.running){
        return;
    }

    state.curValue = calInertialValue(this.stopValue,this._amplitude,elapsed);
    if(Math.abs(this.stopValue-state.curValue)<1){
        state.curValue = this.stopValue;
        this.onFrameCB&&this.onFrameCB();
        this.stop();
    }else{
        this.onFrameCB&&this.onFrameCB();
        requestAnimationFrame(inertialStartHandler.bind(this),this._timeStep);
    }
};

/**
 * y`目标位置，A当前振幅(速度),c时间常量
 * y(t)=y`-A*e^(-t/c)
 * timeConstant = 500; //时间常量，用于惯性滚动的计算中,IOS中为325
 * 返回值为y(t)
 */

const calInertialValue = function(target,amplitude,elapsed){
    const timeConstant = 500;

    return target- amplitude*Math.exp(-elapsed/timeConstant);
};

//继承Animation
InertialAnimation.prototype = Object.create(Animation.prototype);
Object.assign(InertialAnimation.prototype,{
    constructor:InertialAnimation,
    init:function(){
        this._timeStep = 1/this.fps;
    },
    start:function(){
        if(this.state.stateType!==stateTypes.idle){
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function(){
            this.didStartCB&&this.didStartCB();
            this._timeStamp = Date.now();
            requestAnimationFrame(inertialStartHandler.bind(this),this._timeStep);
        }.bind(this),this.startDelay);

    }
});

export default InertialAnimation;