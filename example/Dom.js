window.onload = function(){
	var paintBoard = new SXRender({
        id:'c',
        width:300,
        height:500,
        contentW:300,
        contentH:2000,
        backgroundColor:'rgb(159,192,234)',
        drawScrollBar:true
	});//画板

    
	paintBoard.add({type:'ball',x:200,y:50,radius:50,color:'rgb(255,0,0)',draggable:true});
    paintBoard.add({type:'rect',x:100,y:520,w:100,h:50,color:'rgb(0,0,255)'});
    paintBoard.add({type:'ball',x:150,y:1000,radius:30,color:'rgb(0,122,0)'});
    paintBoard.add({type:'rect',x:220,y:1400,w:100,h:50,color:'rgb(0,0,255)',draggable:true});

    paintBoard.reRender();

    //测试loadImage模块功能。
    loadImage(['../public/img.jpg','../public/pointer.png'],function(success,imgList){
    	console.log(success,imgList);
        paintBoard.add({
			type:'image',
			imgObj:imgList[0].img,
			w:300,
			h:300,
			x:20,
			y:20
		});
        paintBoard.reRender()
	})

};