function mousedownHandler(e){
	 $("#big-ghost").remove();
     $(".ghost-select").addClass("ghost-active");
	 $(".ghost-select").width(0).height(0);
	 
	 var base=$("#grid");
	baseTop=base.offset().top;
	baseLeft=base.offset().left;
	 console.log("baseLeft,baseTop, offsetX, offsetY,pageX,pageY",baseLeft,baseTop,e.offsetX,e.offsetY,e.pageX,e.pageY);
	 
     $(".ghost-select").css({
         left: e.pageX-baseLeft,
         top: e.pageY-baseTop,
		 position:'absolute'
		 });

     initialW = e.pageX;
     initialH = e.pageY;
	 $("#grid").css({position: 'relative'});
	console.log("mousedown",e.pageX,e.pageY);
     $("#grid").bind("mouseup", mouseupHandler);
     $("#grid").bind("mousemove", openSelector);
}
var baseTop,baseLeft;
var mouseDownBinded=false;
function initLocationEdit(mrId){
	var mr=mrData[mrId];
	//$("#floorImage").attr("src","floorImage/"+mr.floor+".png");
	$("#mrIdLocationEdit").val(mr.id);
	$("#position").val("");
	var imageUrl="floorImage/"+mr.floor+".png";
	$("#grid").css('background-image', 'url(' + imageUrl + ')');
	if(!mouseDownBinded){
		$("#grid").bind("mousedown",mousedownHandler);
		mouseDownBinded=true;
	}
}

function mouseupHandler(e) {
	$("#grid").unbind("mousemove", openSelector);
    $("#grid").unbind("mouseup", mouseupHandler);
    var a = $(".ghost-select");
    var aTop = a.offset().top;
    var aLeft = a.offset().left;
    var aW = a.width();
    var aH = a.height();
//     $("body").append("<div id='big-ghost' class='big-ghost'></div>");
//     $("#big-ghost").css({
//         'width': aW,
//         'height': aH,
//         'top':aTop,
//         'left': aLeft
//     });
    $("#position").val(aTop+","+aLeft+","+aW+","+aH);
  //  $(".ghost-select").removeClass("ghost-active");
//     $(".ghost-select").width(0).height(0);
}

function openSelector(e) {
    var w = Math.abs(initialW - e.pageX);
    var h = Math.abs(initialH - e.pageY);

//	console.log("mousemove",w,h,e.pageX,e.pageY);
    $(".ghost-select").css({
        'width': w,
        'height': h,
        'left': Math.min(e.pageX, initialW)-baseLeft,
        'top': Math.min(e.pageY, initialH)-baseTop
    });
}