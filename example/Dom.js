window.onload = function(){
	var paintBoard = new SXRender({
        id:'c',
        width:300,
        height:500,
        contentWidth:300,
        contentHeight:2000,
        backgroundColor:'rgb(159,192,234)',
        drawScrollBar:true
	});//画板


    // paintBoard.add({type:'ball',x:200,y:50,radius:50,color:'rgb(255,0,0)',draggable:true});
    // paintBoard.add({type:'rect',x:100,y:520,w:100,h:50,color:'rgb(0,0,255)'});
    // paintBoard.add({type:'ball',x:150,y:1000,radius:30,color:'rgb(0,122,0)'});
    // paintBoard.add({type:'rect',x:220,y:1400,w:100,h:50,color:'rgb(0,0,255)',draggable:true});
    //
    // paintBoard.reRender();

    var rect = paintBoard.Rect({x:200,y:50,width:100,height:100,fill:'rgb(255,0,0)',draggable:true});
    var circle = paintBoard.Circle({x:200,y:300,radius:50,fill:'rgb(255,0,0)',draggable:true});
    paintBoard.add(rect);
    paintBoard.add(circle);

};