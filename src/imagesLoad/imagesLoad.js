/**
 * Created by lixiang on 2018/2/1.
 */

import {BaseType, checkType, genGUID} from '../utils/utils';

const imagesLoad = function (imageList, callback, timeout) {
    var success = true,
        isTimeout = false,
        count = 0,
        timerId = null,
        itemList = {};

    if (checkType(imageList) === BaseType.String) {
        imageList = {src: imageList};
    }

    if (checkType(timeout) === BaseType.Number && timeout > 0) {
        timerId = window.setTimeout(onTimeout, timeout);
    }

    for (var key in imageList) {
        if (!imageList.hasOwnProperty(key)) {
            continue;
        }
        var item = imageList[key];
        if (checkType(item) === BaseType.String) {
            item = {
                src: item
            };
        }
        if (!item.src) {
            continue;
        }

        count++;

        item.img = new Image();
        item.id = genGUID();

        if (!isTimeout) {
            doLoad(item);
        }
    }

    function doLoad(item) {
        var img = item.img;
        img.onload = function () {
            success = success && true;
            item.status = 'loaded';
            done();
        };
        img.onerror = function () {
            success = false;
            item.status = 'error';
            done();
        };
        img.src = item.src;

        function done() {
            img.onload = img.onerror = null;
            itemList[item.src] = item;
            if (!--count && !isTimeout) {
                var status = {
                    success: success,
                    timeout: isTimeout
                };
                clearTimeout(timerId);
                callback(status, itemList);
            }
        }
    }

    function onTimeout() {
        isTimeout = true;

        var status = {
            success: false,
            isTimeout: isTimeout
        };
        callback(status, itemList);
    }
};


export default imagesLoad