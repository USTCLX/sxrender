/**
 * Created by lixiang on 2018/1/7.
 */


/**
 * 获取元素内相对坐标
 * @param  {[type]} e [description]
 */
const getRelativeRect = function(e){
    var x,y,DomRect;

    x = e.clientX;
    y = e.clientY;

    DomRect = e.target.getBoundingClientRect();

    return {
        x:Math.round(x-DomRect.x),
        y:Math.round(y-DomRect.y)
    }
};

/**
 * 检查点击区域是否有对象,返回对象ID。如果点击空白区域，认为在扒页面
 * @param  {[type]} objs     [description]
 * @param  {[type]} clickPos [description]
 */
const checkClickElm = function(objs,clickPos,contentOffset){
    var obj = null;
    var pos = clickPos;
    for(var i=0,il=objs.length;i<il;i++){
        obj = objs[i];
        if(obj.draggable!==true){
            continue;
        }
        switch (obj.type){
            case 'ball':
                if((pos.x>(obj.x+contentOffset.x-obj.radius))&&(pos.x<(obj.x+contentOffset.x+obj.radius))&&(pos.y>(obj.y+contentOffset.y-obj.radius))&&(pos.y<(obj.y+contentOffset.y+obj.radius))){
                    return obj.id;
                }
                break;
            case 'rect':
                if((pos.x>(obj.x+contentOffset.x))&&(pos.x<(obj.x+contentOffset.x+obj.w))&&(pos.y>(obj.y+contentOffset.y))&&(pos.y<(obj.y+contentOffset.y+obj.h))){
                    return obj.id;
                }
                break;
            case 'image':
                return obj.id;
                break;
            default:
                //click in background
                return 0;
                break;
        }
    }
};

/**
 * 橡皮擦公式
 * @param  {num} x 鼠标移动的距离
 * @param  {num} c 阻尼常量
 * @param  {num} d 容器尺寸
 * @return {num}   实际移动距离
 */
const rubberBanding = function(x,d){
    const c = 0.55;
    if(x>0){
        return Math.round((1-(1/((x*c/d)+1)))*d);
    }else{
        return -Math.round((1-(1/((-x*c/d)+1)))*d)
    }
};

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

const genGUID = function(){
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxx".replace(/[xy]/g,function (c) {
        var r = Math.random()*16|0,v=(c==='x')?r:(r&0x3|0x8);
        return v.toString(16);
    }).toUpperCase();
};

export {getRelativeRect,rubberBanding,calTimingFunctionBySpring,checkClickElm,genGUID};