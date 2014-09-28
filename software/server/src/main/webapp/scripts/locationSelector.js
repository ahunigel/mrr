function mousedownHandler(e){
	 $("#big-ghost").remove();
     $(".ghost-select").addClass("ghost-active");
	 $(".ghost-select").width(0).height(0);
	 
	 console.log(" offsetX, offsetY,pageX,pageY",e.offsetX,e.offsetY,e.pageX,e.pageY);
	 
     $(".ghost-select").css({
         left: e.offsetX,
         top: e.offsetY,
		 position:'absolute'
		 });

     initialW = e.offsetX;
     initialH = e.offsetY;
	 $("#grid").css({position: 'relative'});
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
    var w = Math.abs(initialW - e.offsetX);
    var h = Math.abs(initialH - e.offsetY);

    $(".ghost-select").css({
        'width': w,
        'height': h,
        'left': Math.min(e.offsetX, initialW),
        'top': Math.min(e.offsetY, initialH)
    });
}