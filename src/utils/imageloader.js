//create by lixiang in 2018/2/25
//实现图片预加载

import {checkType, BaseType} from "./utils";

/**
 * 图片预加载
 * @param images 加载图片列表，期望格式[{src:'xxx'}]或者['xx1','xx2']
 * @param callback
 * @param timeout
 */

var imgList = [];

const loadImage = function (images, callback, timeout) {
    var success = true;
    var isTimeOut = false;
    var timeoutId;
    var count = 0;

    var imagesType = checkType(images);
    if (imagesType !== BaseType.Array) {
        throw new Error('argument 0 must be a array');
        return;
    }
    if (checkType(callback) !== BaseType.Function) {
        throw new Error('argument 1 must be a function');
        return;
    }
    if (timeout && checkType(timeout) !== BaseType.Number) {
        throw new Error('argument 2 must be a number');
        return;
    }

    //遍历图像
    for (var key in images) {
        var item = {};
        if (!images.hasOwnProperty(key)) {
            continue;
        }
        if (checkType(images[key]) === BaseType.String) {
            item.src = images[key];
        } else {
            item = images[key];
        }

        if (!item.src) {
            continue;
        }

        count++;
        item.img = new Image();

        imgList.push(item);
        doLoad(item);
    }

    if (!count) {
        callback(success, imgList);
    } else if (timeout > 0) {
        timeoutId = setTimeout(function () {
            isTimeOut = true;
            success = false;
            callback(success, imgList);
        }, timeout);
    }

    function doLoad(item) {
        item.status = 'loading';
        var img = item.img;
        img.onload = function () {
            item.status = 'loaded';
            success = success && true;//只有每一次都成功，才算成功
            done()
        };

        img.onerror = function () {
            item.status = 'error';
            success = false;
            done()
        };

        img.src = item.src;

        function done() {
            img.onload = img.onerror = null;
            if (!--count && !isTimeOut) {
                clearTimeout(timeoutId);
                callback(success, imgList);
            }
        }
    }

};

export default loadImage;