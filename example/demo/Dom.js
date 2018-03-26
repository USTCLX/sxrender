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


    console.log(paintBoard)
    var rect = paintBoard.Rect({x:200,y:50,width:100,height:100,fill:'rgb(255,0,0)',draggable:true});
    var circle = paintBoard.Circle({x:200,y:300,radius:50,fill:'rgb(255,0,0)',draggable:true});
    paintBoard.add(rect);
    paintBoard.add(circle);

};