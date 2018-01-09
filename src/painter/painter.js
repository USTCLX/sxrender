
let Painter = function(){
    /**
     * 清空一片区域
     */
    this.clearCtx =function(opts){
        var x,y,w,h;
        var opts = opts||{};
        x = opts.x||0;
        y = opts.y||0;
        w = opts.w||this.width;
        h = opts.h||this.height;
        this.ctx.clearRect(x, y, w, h)
    };
    //绘制画板背景
    this.drawBackground = function(opts){
        if(!!opts){
            this.backgroundImg.content = opts.imgObj;
            this.backgroundImg.sx = opts.sx||0;
            this.backgroundImg.sy = opts.sy||0;
            this.backgroundImg.sw = opts.sw||0;
            this.backgroundImg.sh = opts.sh||0;
            this.backgroundImg.dx = opts.dx||0;
            this.backgroundImg.dy = opts.dy||0;
            this.backgroundImg.dw = opts.dw||this.width;
            this.backgroundImg.dh = opts.dh||this.height;
        }

        this.ctx.save();
        this.ctx.setTransform(1,0,0,1,0,0);
        if(!this.backgroundImg.content){
            return;
        }
        if(this.backgroundImg.sw&&this.backgroundImg.sh){
            this.ctx.drawImage(this.backgroundImg.content,this.backgroundImg.sx,this.backgroundImg.sy,this.backgroundImg.sw,this.backgroundImg.sh,this.backgroundImg.dx,this.backgroundImg.dy,this.backgroundImg.dw,this.backgroundImg.dh);

        }else{
            this.ctx.drawImage(this.backgroundImg.content,this.backgroundImg.dx,this.backgroundImg.dy,this.backgroundImg.dw,this.backgroundImg.dh);
        }
        this.ctx.restore();
    };
    /**
     * 绘制小球函数
     * @param  {obj} ctx    绘图上下文
     * @param  {num} x      x坐标
     * @param  {num} y      y坐标
     * @param  {num} radius 半径
     * @param  {string} color  颜色
     * @return {[type]}        [description]
     */
    this.drawBall = function(opts){
        var x,y,radius,color;
        var opts = opts||{};
        var startAngle = Math.PI*0;
        var endAngle = Math.PI*2;
        var anticlockwise = false;

        x = opts.x+this.springOffset.x;
        y = opts.y+this.springOffset.y;
        radius = opts.radius;
        color = opts.color;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    };
    /**
     * 画一个矩形
     */
    this.drawRect =function(opts){
        var x,y,w,h,color;
        var opts = opts||{};
        x = opts.x+this.springOffset.x;
        y = opts.y+this.springOffset.y;
        w = opts.w;
        h = opts.h;
        color = opts.color;
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.restore();
    };
    /**
     * 绘制图片
     */
    this.drawImage=function(opts){
        var imgObj,x,y,w,h,dx,dy,dw,dh;
        var opts = opts||{};
        imgObj = opts.imgObj;
        x = opts.x||0;
        y = opts.y||0;
        w = opts.w;
        h = opts.h;
        dx = opts.dx||0;
        dy = opts.dy||0;
        dw = opts.dw||0;
        dh = opts.dh||0;
        this.ctx.save();
        if(dw&&dh){
            this.ctx.drawImage(imgObj,x,y,w,h,dx,dy,dw,dh);
        }else if(w&&h){
            x += this.springOffset.x;
            y += this.springOffset.y;
            this.ctx.drawImage(imgObj, x, y, w, h);
        }else{
            this.ctx.drawImage(imgObj, x, y);
        }
        this.ctx.restore();
    };
};

export default Painter;