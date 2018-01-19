window.onload = function(){
	var paintBoard = new SXRender({
		// id:'c',
		w:300,
		h:2000,
        // contentW:300,
        // contentH:2000,
		drawScrollBar:false
	});//画板

    
	paintBoard.add({type:'ball',x:200,y:50,radius:50,color:'rgb(255,0,0)',draggable:true});
    paintBoard.add({type:'rect',x:100,y:520,w:100,h:50,color:'rgb(0,0,255)'});
    paintBoard.add({type:'ball',x:150,y:1000,radius:30,color:'rgb(0,122,0)'});
    paintBoard.add({type:'rect',x:220,y:1400,w:100,h:50,color:'rgb(0,0,255)',draggable:true});

    paintBoard.reRender();


    var paintBoard2 = new SXRender({
    	id:'c',
    	w:300,
    	h:500,
    	contentW:300,
    	contentH:2000,
    	backgroundColor:'rgb(159,192,234)',
    	drawScrollBar:true
    });


    
    var paintBoardImg = new Image();
    paintBoardImg.onload = function(){
		paintBoard2.add({
	    	type:'image',
	    	imgObj:paintBoardImg,
	    	w:paintBoard.width,
	    	h:paintBoard.height,
	    	x:0,
	    	y:0
	    });
	    paintBoard2.reRender()
    };

    paintBoardImg.src = paintBoard.canvas.toDataURL();

};