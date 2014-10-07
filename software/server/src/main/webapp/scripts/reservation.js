 $("#addMRR").click(addMRR);
 

$("#addMRR").click(addMRR);
$("#singleRes").click(getReservationTypeTimeRange);
$("#recurrentRes").click(getReservationTypeTimeRange);
var reservationType = "SINGLE";

function getReservationTypeTimeRange(e)
{
	reservationType = e.currentTarget.value;
	if (reservationType == "SINGLE")
	{
		$("#mrStartTime").show();
		$("#mrEndTime").show();
	}
	else
	{
		$("#mrStartTime").hide();
		$("#mrEndTime").hide();
	}

}

function addMRR()
{
	$("#mrrEditDialogHeader").html("Add Meeting Room Reservation");
	$("#saveEditMRRBtn").click(function (e)
	{
		if (!reservationValidate())
		{
			e.preventDefault();
			return;
		}
		if (reservationType != "SINGLE")
		{
			e.preventDefault();
			alert("Not implemented Recurrent type, please select single !");
			return;
		}
		var resData = {};
		resData.meetingSubject = $("#meetingSubject").val();
		var mr = document.getElementById("mrrFloorMeetingRoom");
		resData.meetingRoom = {id:mr.options[mr.selectedIndex].value};
		resData.reservedPerson = {id:1};
		resData.reservationType = "SINGLE";
		resData.startTime = $('#startTime').datetimepicker("getDate");
		resData.endTime = $('#endTime').datetimepicker("getDate");
		var xhr = new XMLHttpRequest();
		xhr.open('PUT',"ws/meetingroomReservation/reservation" , true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

		// send the collected data as JSON
	 
		xhr.onreadystatechange=function()
		{
			if (xhr.readyState==4 && xhr.status==200)
			{
				data = http.responseText;
				if (!data.id)
				{
					alert("The date time range of the meeting room reservation in conflict with others ,please rebook!");
				}
			}
		}
		xhr.send(JSON.stringify(resData));
	});
}

function reservationValidate()
{
	var isSubjectValid = true;
	var subValue = $("#meetingSubject").val();
	if (!subValue || subValue == "")
	{
		$('#mrSubjectErrorMsg')
				.html(
						"The meeting room reservation subject is required and cannot be empty");
		$("#mrSubject").addClass("has-error");
		isSubjectValid = false;
	}
	else if (subValue.length < 6 || subValue.length > 300)
	{
		$('#mrSubjectErrorMsg')
				.html(
						"The meeting room reservation subject must be more than 6 and less than 300 characters long");
		$("#mrSubject").addClass("has-error");
		isSubjectValid = false;
	}
	else
	{
		$('#mrSubjectErrorMsg').html("");
		$("#mrSubject").removeClass("has-error");
	}

	if (reservationType != "SINGLE")
	{
		return isSubjectValid;
	}

	var isStartTimeValid = true;
	var isEndTimeValid = true;
	var startTimeValue = $('#startTime').val();
	var endTimeValue = $('#endTime').val();
	var starTi = null;

	if (!startTimeValue || startTimeValue == "")
	{
		$('#startTimeErrorMsg').html("The start date is required");
		$("#mrStartTime").addClass("has-error");
		isStartTimeValid = false;
	}
	else
	{
		starTi = new Date(Date.parse(startTimeValue));
		var tempTi = new Date();
		if (starTi.getTime() < tempTi.getTime())
		{
			$('#startTimeErrorMsg').html(
					"The start date cannot be older than current time!");
			$("#mrStartTime").addClass("has-error");
			isStartTimeValid = false;
		}
		else
		{
			$('#startTimeErrorMsg').html("");
			$("#mrStartTime").removeClass("has-error");
		}
	}

	if (!endTimeValue || endTimeValue == "")
	{
		$('#endTimeErrorMsg').html("The end date is required");
		$("#mrEndTime").addClass("has-error");
		isEndTimeValid = false;
	}
	else
	{
		var endTi = new Date(Date.parse(endTimeValue));
		var tempTi = new Date();
		tempTi.setDay(tempTi.getDay() + 1);
		tempTi.setHours(0);
		tempTi.setMinutes(0);
		tempTi.setSeconds(0);
		if (endTi.getTime() > tempTi.getTime())
		{
			$('#endTimeErrorMsg').html(
					"The end date time cannot be older than today!");
			$("#mrEndTime").addClass("has-error");
			isEndTimeValid = false;
		}
		else if (starTi && endTi.getTime() <= starTi.getTime())
		{
			$('#endTimeErrorMsg').html(
					"The end date cannot be early than start date !");
			$("#mrEndTime").addClass("has-error");
			isEndTimeValid = false;
		}
		else
		{
			$('#endTimeErrorMsg').html("");
			$("#mrEndTime").removeClass("has-error");
		}
	}

	if (isSubjectValid && isStartTimeValid && isEndTimeValid)
	{
		return true;
	}
	else
	{
		return false;
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
