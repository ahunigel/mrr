 $("#addMRR").click(addMRR);
function addMRR()
{
	$("#mrrEditDialogHeader").html("Add Meeting Room Reservation");
	var editForm=document.getElementById("editMRRForm");
	
	editForm.onsubmit = function (e) {
		  // stop the regular form submission
		e.preventDefault();
		var resData = {};
		var dFormat = "yyyy/mm/dd   HH:ii P";
		resData.meetingSubject = $("#meetingSubject").val();
		var mr = document.getElementById("mrrFloorMeetingRoom");
		resData.meetingRoom = {id:mr.options[mr.selectedIndex].value;};
		resData.reservedPerson = currentUser;
		resData.reservationType = 0;
		resData.startTime = Date.parseDate($("#meetingSubject").val(), dFormat);
		resData.endTime = Date.parseDate($("#meetingSubject").val(), dFormat);
	}
}

function loadDateTimePicker()
{
	 $('.form_datetime').datetimepicker({
	        weekStart: 1,
	        todayBtn:  1,
			autoclose: 1,
			todayHighlight: 1,
			startView: 2,
			forceParse: 0,
	        showMeridian: 1
	    });
		$('.form_date').datetimepicker({
	        weekStart: 1,
	        todayBtn:  1,
			autoclose: 1,
			todayHighlight: 1,
			startView: 2,
			minView: 2,
			forceParse: 0
	    });
		$('.form_time').datetimepicker({
	        weekStart: 1,
	        todayBtn:  1,
			autoclose: 1,
			todayHighlight: 1,
			startView: 1,
			minView: 0,
			maxView: 1,
			forceParse: 0
	    });
}

loadDateTimePicker();
