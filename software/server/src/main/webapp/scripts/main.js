$("#logout").click(function(){
	currentUser=null;
	location.href='index.html';
});

function initMain(){
	$(".welcome").html("Welcome "+currentUser.name); 
	 $("#lists li").click(function(){
            var index = $(this).index();
            switch (index)
			{
				case 0:// avaliable meeting room
					loadAvaliableMeetingRoomStatus();
					break;
				case 1: // all meeting room
					loadAllMeetingRoomStatus();
					break;
				case 2: // my reservation
					loadMyReservaion();
					break;
				case 3: // report
					// not implemented.
					break;
				case 4: // administrator tool
					loadMRList();
					break;
				default:
					break;
			}
         });
	if(currentUser.role=="ADMIN"){		
		$("#adminDiv").show();
		$("#addMR").click(addMR);
		$("#image").fileinput({previewSettings:{ image: {width: "240px", height: "240px"},}});
		var imageUploadForm=document.getElementById("imageUploadForm");
		imageUploadForm.onsubmit=uploadImage;
		initValidate();
		$("#showUploadImgBtn").click(function(){			
			$("#image").fileinput('reset');
		});
	}else
	{
		$("#adminDiv").hide();
	}
}

function initValidate(){
	 $('#editMRForm').bootstrapValidator({
	        message: 'This value is not valid',
	        feedbackIcons: {
	            valid: 'glyphicon glyphicon-ok',
	            invalid: 'glyphicon glyphicon-remove',
	            validating: 'glyphicon glyphicon-refresh'
	        },
	        fields: {
	        	name: {
	                message: 'The meeting room name is not valid',
	                validators: {
	                    notEmpty: {
	                        message: 'The meeting room name is required and cannot be empty'
	                    }
	                }
	            },
	            floor: {
	            	 message: 'The floor is not valid',
	            	 validators: {
		                    notEmpty: {
		                        message: 'The floor is required and cannot be empty'
		                    },
	            			greaterThan:{
	            				value:0,
	            				message:'the floor should greater than 0'
	            				
	            			}
	            	 }
	            },
	            seats: {
	                message: 'The seats is not valid',
	                validators: {
	                    notEmpty: {
	                        message: 'The seats is required and cannot be empty'
	                    },
	                    digits:{
	                    	message: 'The seats can be digital only'
	            		}
	                }
	            }
	        }
	 });
}
function uploadImage(e){
	e.preventDefault();
	document.getElementById('data').contentWindow.document.body.innerHTML="Uploading...";
	if($("#imagePath").val()){
		$("#mrId").val($("#imagePath").val());
	}
	document.getElementById("imageUploadForm").submit();
	var checkResutl=function()
	{
		var	data=document.getElementById('data').contentWindow.document.body.innerHTML;
		if(data=="Uploading..."){		
			setTimeout(checkResutl,100);		
		}else{
			console.log("uploaded "+data);
			$("#imageDisplay").attr("src","mrimages?t="+Math.random()+"&image="+data);
			$("#imagePath").val(data);
			$("#closeUploadDialog").click();
		}
	}
	setTimeout(checkResutl,100);
	
}
var mrData;
function addMR(){
	$("#mrEditDialogHeader").html("Add Meeting Room");
	var editForm=document.getElementById("editMRForm");
	for (var i = 0, ii = editForm.length; i < ii; ++i) {
	    var input = editForm[i];
	    if (input.name) {
			if(input.type=='checkbox'){
				input.checked=false;
			}
			else{
				input.value = '';
			}
	    }
	}
	$("#imageDisplay").attr("src","img/noImage.png");
	editForm.onsubmit = function (e) {
		  // stop the regular form submission
		e.preventDefault();
		sendData(editForm,"PUT",true);
	}
}

var deleteMR=function(id){
	$("#delMRBtn").click(function(){
		var xhr = new XMLHttpRequest();
		 xhr.open("DELETE", "ws/meetingrooms/"+id, true);
		 xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

		 // send the collected data as JSON
		 xhr.onreadystatechange=function()
		{
			if (xhr.readyState==4)
			{
				loadMRList();
			}
		}
		 xhr.send();
	});
}

var editMR=function(id){
	$("#mrEditDialogHeader").html("Eidt Meeting Room");
	var editForm=document.getElementById("editMRForm");
	  var mr=mrData[id];
	  for (var i = 0, ii = editForm.length; i < ii; ++i) {
	    var input = editForm[i];
	    if (input.name) {
			if(input.type=='checkbox'){
				input.checked = mr[input.name];
			}
			else{
				input.value = mr[input.name];
			}
		}
	  }
	  if(mr.image){
		$("#imageDisplay").attr("src","mrimages?image="+mr.image);
	  }else{
		$("#imageDisplay").attr("src","img/noImage.png");
	  }
	editForm.onsubmit = function (e) {
			  // stop the regular form submission
		e.preventDefault();
		sendData(editForm,"POST",false);
	}
}

function sendData(editForm,method,ignoreId){
	 var data = {};
	  for (var i = 0, ii = editForm.length; i < ii; ++i) {
	    var input = editForm[i];
	    if (input.name&&((input.name=='id'&&!ignoreId)||input.name!='id')) {
			if(input.type=='checkbox'){
				data[input.name] = input.checked;
			}
			else{
				data[input.name] = input.value;
			}
		}
	  }
	  
	  var xhr = new XMLHttpRequest();
	  xhr.open(method,"ws/meetingrooms" , true);
	  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

	  // send the collected data as JSON
	 
	 xhr.onreadystatechange=function()
	{
	  if (xhr.readyState==4 && xhr.status==200)
		{
			
			loadMRList();
			$("#closeEditMRBtn").click();
		}
	 }
	  xhr.send(JSON.stringify(data));
	 
}


function  loadMRList (){
	$.get("ws/meetingrooms?"+Math.random(), function (data) {
		var mrTab=document.getElementById("mrContainer");
		mrTab.innerHTML="";
		mrData=data;
		for(var i=0;i<mrData.length;i++){
			var row=mrTab.insertRow(i);
			row.insertCell(0).innerHTML=mrData[i].name;
			row.insertCell(1).innerHTML='<a data-toggle="modal" data-target="#editLocation" onclick="initLocationEdit('+i+')">'+mrData[i].floor+'F '+mrData[i].location+'</a>';
			row.insertCell(2).innerHTML=mrData[i].seats;
			
			row.insertCell(3).innerHTML='<input type="checkbox" '+(mrData[i].phoneExist==true?'checked':'')+' disabled/>';
			row.insertCell(4).innerHTML='<input type="checkbox" '+(mrData[i].projectorExist?'checked':'')+' disabled/>';
			
			row.insertCell(5).innerHTML='<input type="button" class="btn btn-primary" data-toggle="modal" data-target="#meetingRoomEdit" value="edit" onclick="editMR('+i+')"/> <input type="button" class="btn btn-danger" data-toggle="modal" data-target="#MyModal1" value="delete" onclick="deleteMR('+mrData[i].id+')"/>';
		}
	  });
}

initMain();