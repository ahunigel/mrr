$("#logout").click(function(){
	currentUser=null;
	$('body').load('index.html');
});

function initMain(){
	$(".welcome").html("Welcome "+currentUser.name); 
	 $("#lists li").click(function(){
         //alert("you click the ul li");  //for test the list li click
            var index = $(this).index();
            if(index==4){
            	loadMRList();
            }
         });
	if(currentUser.role=="ADMIN"){		
		$("#adminDiv").show();
		$("#addMR").click(addMR);
	}else
	{
		$("#adminDiv").hide();
	}
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
		}
	 }
	  xhr.send(JSON.stringify(data));
	 
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
	editForm.onsubmit = function (e) {
			  // stop the regular form submission
		e.preventDefault();
		sendData(editForm,"POST",false);
	}
}
function  loadMRList (){
	$.get("ws/meetingrooms?"+Math.random(), function (data) {
		var mrTab=document.getElementById("mrContainer");
		mrTab.innerHTML="";
		mrData=data;
		for(var i=0;i<mrData.length;i++){
			var row=mrTab.insertRow(i);
			row.insertCell(0).innerHTML=mrData[i].name;
			row.insertCell(1).innerHTML=mrData[i].floor+'F '+mrData[i].location;
			row.insertCell(2).innerHTML=mrData[i].seats;
			
			row.insertCell(3).innerHTML='<input type="checkbox" '+(mrData[i].phoneExist==true?'checked':'')+' disabled/>';
			row.insertCell(4).innerHTML='<input type="checkbox" '+(mrData[i].projectorExist?'checked':'')+' disabled/>';
			
			row.insertCell(5).innerHTML='<input type="button" class="btn btn-primary" data-toggle="modal" data-target="#meetingRoomEdit" value="edit" onclick="editMR('+i+')"/> <input type="button" class="btn btn-danger" data-toggle="modal" data-target="#MyModal1" value="delete" onclick="deleteMR('+mrData[i].id+')"/>';
		}
	  });
}


initMain();