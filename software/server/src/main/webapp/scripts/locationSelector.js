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


var editCssChange=false;
function initLocationEdit(mrId, hideSubmit){
	var mr=mrData[mrId];
	//$("#floorImage").attr("src","floorImage/"+mr.floor+".png");
	$("#mrIdLocationEdit").val(mr.id);
	$("#position").val(mr.position);
	var imageUrl="floorImage/"+mr.floor+".png";
	$("#grid").css('background-image', 'url(' + imageUrl + ')');
	$("#grid").css('background-size', 'cover');
	if(!editCssChange){
		$("#editLocation").css(
			'margin-left', function () { //Horizontal centering
			return -($(this).width() / 2);
		});
		editCssChange=true;
	}
	if(hideSubmit){
		$("#locationEditSubmit").hide();
	}else{
		$("#locationEditSubmit").show();
	}
	$("#locationEditSubmit").unbind("click");
	$("#locationEditSubmit").click(function (e) {
		// stop the regular form submission
		e.preventDefault();
		// submit data();
		
		//close dialogArguments
		
		sendLocationData();
	});
	if(!mouseDownBinded&&!hideSubmit){
		$("#grid").bind("mousedown",mousedownHandler);
		mouseDownBinded=true;
	}
	if(hideSubmit){
		$("#grid").unbind("mousedown");
		mouseDownBinded=false;
	}
}

function sendLocationData(){
	 var data = {};
	 var editForm=document.getElementById("locationEditForm");
	  for (var i = 0, ii = editForm.length; i < ii; ++i) {
	    var input = editForm[i];
			if(input.type=='checkbox'){
				data[input.name] = input.checked;
			}
			else{
				if ((input.name == "position") && (input.value == null || input.value.length < 1))
				{
					alert("The value of "+input.name+" cannot be null");
					return;
				}
				else
				{
					data[input.name] = input.value;
				}
			}
		
	  }
	  
	  var xhr = new XMLHttpRequest();
	  xhr.open("POST","ws/meetingrooms/position" , true);
	  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

	  // send the collected data as JSON
	 
	 xhr.onreadystatechange=function()
	{
	  if (xhr.readyState==4 && xhr.status==200)
		{			
			$("#closeLocationEditDialog").click();
		}
	 }
	  xhr.send(JSON.stringify(data));
	 
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
