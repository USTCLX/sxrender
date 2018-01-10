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
 * 生成uuid
 * @returns {string}
 */
const genGUID = function(){
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxx".replace(/[xy]/g,function (c) {
        var r = Math.random()*16|0,v=(c==='x')?r:(r&0x3|0x8);
        return v.toString(16);
    }).toUpperCase();
};

/**
 * 深拷贝
 */
const deepClone = function(values){
    var copy;
    if(null===values||"object"!==typeof values){
        return values
    }

    if(values instanceof Date){
        copy = new Date();
        copy.setTime(values.getTime());
        return copy;
    }

    if(values instanceof Array){
        copy = [];
        for(var i=0,len=values.length;i<len;i++){
            copy[i] = deepClone(values[i]);
        }
        return copy;
    }

    if(values instanceof Object){
        copy = {};
        for(var key in values){
            if(values.hasOwnProperty(key)){
                copy[key] = deepClone(values[key]);
            }
        }
        return copy;
    }
};

export {getRelativeRect,rubberBanding,checkClickElm,genGUID};