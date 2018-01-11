import Animation from './Animation';
import {stateTypes,valueTypes} from "./common";
import requestAnimationFrame from './requestAnimationFrame'
import {deepClone} from "../utils/utils";


//惯性滚动动画
let InertialAnimation = function(target,key,startValue,stopValue,amplitude,opts){
    Animation.apply(this,[target,key,startValue,stopValue,null,opts]);

    this.amplitude = amplitude;
    this.init();
};

const inertialAnimateHandler = function(){
    var elapsed = Date.now()-this._timeStamp;
    var state = this.state;

    if(this.state.stateType!==stateTypes.running){
        return;
    }

    state.curValue = calInertialValue(this.stopValue,this.amplitude,elapsed,this._valueType);
    if(this._valueType===valueTypes.object){
        var arr = [];
        var len= 0;
        var i = 0;
        for(var key in state.curValue){
            if(state.curValue.hasOwnProperty(key)){
                len++;
                if(Math.abs(this.stopValue[key]-state.curValue[key])<1){
                    i++;
                    state.curValue[key] = this.stopValue[key];
                }
            }
        }
        if(i===len){
            //所有属性都已达到临界值
            this.onFrameCB&&this.onFrameCB();
            this.stop();
            return
        }
    }else if(this._valueType===valueTypes.number){
        if(Math.abs(this.stopValue-state.curValue)<1){
            state.curValue = this.stopValue;
            this.onFrameCB&&this.onFrameCB();
            this.stop();
            return;
        }
    }

    this.onFrameCB&&this.onFrameCB();

    this._lastTimeStamp = Date.now();
    this.lastState = deepClone(this.state);
    requestAnimationFrame(inertialAnimateHandler.bind(this),this._timeStep);

};

/**
 * y`目标位置，A当前振幅(速度),c时间常量
 * y(t)=y`-A*e^(-t/c)
 * timeConstant = 500; //时间常量，用于惯性滚动的计算中,IOS中为325
 * 返回值为y(t)
 */

const calInertialValue = function(target,amplitude,elapsed,valueType){
    const timeConstant = 500;

    if(valueType===valueTypes.object){
        var obj = {};
        for(var key in target){
            if(target.hasOwnProperty(key)){
                obj[key] = target[key] - amplitude[key]*Math.exp(-elapsed/timeConstant);
            }
        }
        return obj;
    }else{
        return target- amplitude*Math.exp(-elapsed/timeConstant);
    }

};


//继承Animation
InertialAnimation.prototype = Object.create(Animation.prototype);
Object.assign(InertialAnimation.prototype,{
    constructor:InertialAnimation,
    start:function(){
        if(this.state.stateType!==stateTypes.idle){
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function(){
            this.didStartCB&&this.didStartCB();
            this._timeStamp = Date.now();
            this._lastTimeStamp = Date.now();
            this.lastState = deepClone(this.state);
            requestAnimationFrame(inertialAnimateHandler.bind(this),this._timeStep);
        }.bind(this),this.startDelay);
    }
});

export default InertialAnimation;