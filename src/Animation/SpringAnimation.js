import Animation from './Animation';
import {stateTypes, valueTypes,interpolateNumber, interpolateObject} from "./common";
import requestAnimationFrame from './requestAnimationFrame';

/**
 * 根据阻尼系数，弹力系数，初始速度，初始位置信息，计算出进度p关于时间t的函数
 * @param  {num} damping         阻尼系数
 * @param  {num} stiffness       弹力系数
 * @param  {num} initialVelocity 初始速度
 * @param  {num} startX          初始位置
 * @return {fun}                 p关于t的函数
 */
const calTimingFunctionBySpring = function(damping,stiffness,initialVelocity,startX) {
    var c = damping;
    var k = stiffness;
    var v = initialVelocity;
    var t = c*c - 4 * k;
    var r1,r2;
    var alpha,beta;
    var f0;
    var fp0;
    f0 = (startX || 0) -1;
    fp0 = v;
    var C1,C2;
    if (t>0) {
        t = Math.sqrt(t);
        r1 = (-c+t)*0.5;
        r2 = (-c-t)*0.5;

        C1 = (fp0 - r2*f0)/(r1-r2);
        C2 = (fp0 - r1*f0)/(r2 - r1);
        return function (t) {
            return C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t) + 1;
        }
    }else if (t==0) {
        r1 = -c * 0.5;
        C1 = f0;
        C2 = fp0 - C1 * r1;
        return function (t) {
            return (C1 + C2 * t)*Math.exp(r1 * t) + 1;
        }

    }else{
        t = Math.sqrt(-t);
        alpha = -c *0.5;
        beta = t * 0.5;

        C1 = f0;
        C2 = (fp0-alpha*f0)/beta;
        return function (t) {
            return (C1 * Math.cos(beta*t) + C2 * Math.sin(beta*t)) * Math.exp(alpha * t) + 1;
        }
    }
};

/**
 * initialVelocity 初始速度
 * damping 阻尼系数,一般为12
 * stiffness 弹力系数,一般为180
 * duration 弹跳动画持续时间，一般为2000ms
 */
let SpringAnimation = function(target,key,initialVelocity,damping,stiffness,startValue,stopValue,duration,startX){
    Animation.apply(this,[target,key,startValue,stopValue,duration]);
    this.initialVelocity = initialVelocity||0;
    this.damping = damping||12;
    this.stiffness = stiffness||180;
    this.startX = startX||0;

};
//继承Animation
SpringAnimation.prototype = Object.create(Animation.prototype);

const springAnimateHandler = function(){
    if(this.state.stateType!==stateTypes.running){
        return;
    }
    this._p = this.timingFun(this.state.curFrame/this._totalFrames);

    if(this.startX===0){
        this.state.curValue = (this._valueType!==valueTypes.object)?interpolateNumber(this.startValue,this.stopValue,this._p):interpolateObject(this.startValue,this.stopValue,this._p);
    }else if(this.startX===1){
        //在平衡位置，以一个初速度开始弹跳
        this.state.curValue = this._p-1;
    }

    if(this.target&&this.target.hasOwnProperty(this.key)){
        this.target[this.key] = this.state.curValue;
    }

    this.onFrameCB&&this.onFrameCB();
    if(this.state.curFrame<this._totalFrames){
        requestAnimationFrame(springAnimateHandler.bind(this),this._timeStep);
    }else{
        this.state.curValue = this.stopValue;
        this.didStopCB&&this.didStopCB();
        this.stop();
    }
    this.state.curFrame++;
};

Object.assign(SpringAnimation.prototype,{
    constructor:SpringAnimation,
    start:function(){
        if(this.state.stateType!==stateTypes.idle){
            return;
        }
        this.state.stateType = stateTypes.running;
        this.timingFun = calTimingFunctionBySpring(this.damping,this.stiffness,this.initialVelocity,this.startX);
        setTimeout(function(){
            this.didStartCB&&this.didStartCB();
            this._timeStamp = Date.now();
            requestAnimationFrame(springAnimateHandler.bind(this),this._timeStep);
        }.bind(this),this.startDelay);
    }
});

export default SpringAnimation;