/**
 * Created by lixiang on 2018/1/8.
 */

import requestAnimationFrame from './requestAnimationFrame';
import {timingFunctions,stateTypes,valueTypes,State,interpolateNumber,interpolateObject} from "./common"
import {deepClone} from '../utils/utils';



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
    this._p = 0;                 //进度
    this._totalFrames = 0;       //总帧数
    this._timeStep = 0;          //定时器间隔
    this._timeStamp = 0;         //开始动画事件戳
    this._lastTimeStamp = 0;     //动画帧时间戳
    this._valueType = valueTypes.number;

    this.init();
};

const coreAnimateHandler = function(){
    if(this.state.stateType!==stateTypes.running){
        return;
    }

    this._p = this.timingFun(this.state.curFrame/this._totalFrames);

    this.state.curValue = (this._valueType!==valueTypes.object)?interpolateNumber(this.startValue,this.stopValue,this._p,this.state.resveringeState):interpolateObject(this.startValue,this.stopValue,this._p,this.state.resveringeState);

    if(this.target&&this.target.hasOwnProperty(this.key)){
        this.target[this.key] = this.state.curValue;
    }

    this.onFrameCB&&this.onFrameCB();

    this.lastState = deepClone(this.state);
    this._lastTimeStamp = Date.now();


    if(this.state.curFrame<this._totalFrames){
        //执行动画
        requestAnimationFrame(coreAnimateHandler.bind(this),this._timeStep);
    }else if(this.autoReverse&&!this.state.resveringeState){
        //自动回溯
        this.state.resveringeState = true;
        this.state.curFrame = 0;
        requestAnimationFrame(coreAnimateHandler.bind(this),this._timeStep);
    }else if(this.state.repeat<(this.repeatCount-1)){
        //重复动画
        this.state.repeat++;
        this.state.curFrame = 0;
        this.state.resveringeState = false;
        requestAnimationFrame(coreAnimateHandler.bind(this),this._timeStep);
    }else{
        this.state.curValue = this.stopValue;
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
        this._timeStep = Math.round(1000/this.fps);
        //判断valueType
        switch (typeof this.startValue){
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
    start:function(){
        if(this.state.stateType!==stateTypes.idle){
            return;
        }

        this.state.stateType = stateTypes.running;

        setTimeout(function(){
            this.didStartCB&&this.didStartCB();
            this._lastTimeStamp = Date.now();
            this.lastState = deepClone(this.state);
            requestAnimationFrame(coreAnimateHandler.bind(this),this._timeStep);
        }.bind(this),this.startDelay);

    },
    stop:function(){
        //reset
        this.state.stateType = stateTypes.idle;
        this.state.curValue = 0;
        this.state.curFrame = 0;
        this.state.repeat = 0;
        this.state.resveringeState = false;

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
            this.state.stateType = stateTypes.running;
            requestAnimationFrame(coreAnimateHandler.bind(this),this._timeStep);
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

