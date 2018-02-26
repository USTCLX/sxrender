/**
 * Created by lixiang on 2018/2/26.
 */

class Storage {
    constructor() {
        this.objects = [];
    }

    addObj(obj) {
        this.objects.push(obj);
    }

    findById(id) {
        var objs = this.objects;
        for (var i = 0, il = objs.length; i < il; i++) {
            if (objs[i].id === id) {
                return objs[i];
            }
        }
    }

    deleteById(id) {
        var objs = this.objects;
        for (var i = 0, il = objs.length; i < il; i++) {
            if (objs[i].id === id) {
                objs.splice(i, 1);
                return;
            }
        }
    }
}

export default Storage;
