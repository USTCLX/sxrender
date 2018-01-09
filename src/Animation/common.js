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
    //spring
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

export {timingFunctions,stateTypes,State}