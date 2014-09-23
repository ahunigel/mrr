
function initMain(){
 $("#username").html(currentUser.name);     
	if(currentUser.role=="ADMIN"){		
		initAdmin();
		$("#adminDiv").show();
	}else
	{
		$("#adminDiv").hide();
	}
}

function  loadMRList (){
	$.get("ws/meetingrooms", function (mrData) {
		var mrTab=document.getElementById("mrContainer");
		for(var i=0;i<mrData.length;i++){
			var row=mrTab.insertRow(i);
			row.insertCell(0).innerHTML=mrData[i].name;
			row.insertCell(1).innerHTML=mrData[i].floor+'F '+mrData[i].location;
			row.insertCell(2).innerHTML=mrData[i].seats;
			
			row.insertCell(3).innerHTML='<input type="checkbox" '+(mrData[i].phoneExist==true?'checked':'')+' disabled/>';
			row.insertCell(4).innerHTML='<input type="checkbox" '+(mrData[i].projectorExist?'checked':'')+' disabled/>';
			
			row.insertCell(5).innerHTML='<input type="button" class="btn btn-primary" data-toggle="modal" data-target="#MyModal" value="edit" onclick="editMR('+i+')"/> <input type="button" class="btn btn-danger" data-toggle="modal" data-target="#MyModal1" value="delete" onclick="deleteMR('+mrData[i].id+')"/>';
		}
	  });
}

function initAdmin(){
	loadMRList ();
}


initMain();