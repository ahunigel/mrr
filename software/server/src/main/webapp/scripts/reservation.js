 $("#addMRR").click(addMRR);
 $("#cancelMRR").click(resetReservation);
$("#meetingSubject").change(mrrSubjectChange);
$("#mrrFloor").change(getMrFloorChange);
$("#singleRes").click(getReservationTypeTimeRange);
$("#recurrentRes").click(getReservationTypeTimeRange);
$("#resInterval").change(checkRecInterval);

var reservationType = "SINGLE";
var mrObj = [];
var floorOptions = [];
var numPattern = /^\d+$/;

function loadMeetingRooms()
{
	$.get("ws/meetingrooms?"+Math.random(), function (data) {
		var option = null;
		for(var i=0;i<data.length;i++)
		{
			var fl = null;
			option = new Option(data[i].id, data[i].name);
			if (!mrObj[data[i].floor])
			{
				fl = new Option(data[i].floor, data[i].floor);
				mrObj[data[i].floor] = {id:data[i].floor,data:[]};
			}
			
			if (fl)
			{
				floorOptions.push(fl);
			}
			mrObj[data[i].floor].data.push(option);
		}
		if (floorOptions.length > 0)
		{
			floorOptions.sort(function(a,b){
				if (a.value > b.value)
				{
					return -1;
				}
				if (a.value < b.value)
				{
					return 1;
				}
				 
				 return 0;
			});
			$("#mrrFloor").append(floorOptions);
			for (var i = 0; i < floorOptions.length; i++)
			{
				var fValue = floorOptions[i].value;
				$("#mrrFloorMeetingRoom").append(mrObj[fValue].data);
				break;
			}
		}
		
	  });
}

function getMrFloorChange()
{
	var fValue = this[this.selectedIndex].value;
	$("#mrrFloorMeetingRoom").html(mrObj[fValue].data);
}

function mrrSubjectChange()
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
		
}


function getReservationTypeTimeRange(e)
{
	reservationType = e.currentTarget.value;
	if (reservationType == "SINGLE")
	{
		$("#recurrentChoice").addClass("hide");
		$("#singleChoice").removeClass("hide");
	}
	else
	{
		$("#singleChoice").addClass("hide");
		$("#recurrentChoice").removeClass("hide");
	}

}

function resetReservation()
{
	var editForm = document.getElementById("editMRRForm");
	for (var i = 0, ii = editForm.length; i < ii; ++i)
	{
		var input = editForm[i];

		if (input.type == 'radio')
		{
			if (input.value == "SINGLE")
			{
				$("#recurrentChoice").addClass("hide");
				$("#singleChoice").removeClass("hide");
				input.checked = true;
			}
			else if (input.value == "DAILY")
			{
				input.checked = true;
			}
			else
			{
				input.checked = false;
			}
		}
		else if (input.type == 'select-one')
		{
			input.value = input[0].value;
		}
		else
		{
			input.value = '';
		}

	}
}

function editMrrForm(res)
{
	$("#meetingSubject").val(res.meetingSubject);
	$("#mrrFloor").val(res.meetingRoom.floor);
	$("#mrrFloorMeetingRoom").val(res.meetingRoom.id);
	if (res.reservationType == "SINGLE")
	{
		$("#singleRes").attr("checked","checked");
		$("#recurrentRes").removeAttr("checked");
		$("#recurrentChoice").addClass("hide");
		$("#singleChoice").removeClass("hide");
		$('#startTime').val(res.startTime.format("yyyy/mm/dd   HH:ii P"));
		$('#endTime').val(res.endTime.format("yyyy/mm/dd   HH:ii P"));
	}
	else
	{
		$("#singleChoice").addClass("hide");
		$("#recurrentChoice").removeClass("hide");
		var hour = recurrentStartTime % 60;
		var minutes = recurrentStartTime - hour * 60;
		var dateWithTime = new Date()
		dateWithTime.setHours(hour);
		dateWithTime.setMinutes(minutes);
		$('#recStartTime').val(dateWithTime.format("HH:ii P"));
		hour = recurrentEndTime % 60;
		minutes = recurrentEndTime - hour * 60;
		dateWithTime.setHours(hour);
		dateWithTime.setMinutes(minutes);
		$('#recEndTime').val(dateWithTime.format("HH:ii P"));
		if (res.recurrentType != "DAILY")
		{
			$("#" +res.recurrentType).attr("checked","checked");
		}
		$('#resInterval').val(res.recurrentInterval);
		$('#recStartDate').val(res.startTime.format("yyyy/mm/dd"));
		$('#recEndDate').val(res.endTime.format("yyyy/mm/dd"));
	}
	
}

function submitMRR(e)
{
	mrrSubjectChange();
	if(reservationType == "SINGLE")
	{
		checkStartTimeChange("#startTime","start date time");
		checkEndTimeChange("#endTime","#startTime", "end date time", true, false);
	}
	else
	{
		checkRecInterval();
		checkStartTimeChange("#recStartTime", "start time");
		checkEndTimeChange("#recEndTime","#recStartTime", "end time", false, true);
		checkStartTimeChange("#recStartDate", "start time");
		checkEndTimeChange("#recEndDate","#recStartDate", "end time", false, false);
	}
	
	if ($('#editMRRForm .has-error').length > 0)
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
	if (mrrId)
	{
		resData.id = mrrId;
	}
	resData.meetingSubject = $("#meetingSubject").val();
	var mr = $("#mrrFloorMeetingRoom option:selected").val();
	resData.meetingRoom = {id:mr.options[mr.selectedIndex].value};
	resData.reservedPerson = {id:1};
	resData.reservationType = "SINGLE";
	resData.startTime = $('#startTime').datetimepicker("getDate");
	resData.endTime = $('#endTime').datetimepicker("getDate");
	var xhr = new XMLHttpRequest();
	xhr.open('PUT', "ws/meetingroomReservation/reservation", true);
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
}

function addMRR()
{
	if (floorOptions.length < 1)
	{
		alert("The reservation cannot be shown due to there is no meeting room to choice, please contact administrator !");
		$("#mrrEditDialogHeader").modal('hide');
		return;
	}
	
	$("#mrrEditDialogHeader").html("Add Meeting Room Reservation");
	$("#saveEditMRRBtn").click(submitMRR);

}

function checkRecInterval()
{
	var isIntervalValid = true;
	var intValue = $("#resInterval input").val();
	var msg = null;
	if (numPattern.test(intValue) && intValue>100 || intValue < 1)
	{
		$("#resInterval input").val("");
		$("#resIntervalErrorMsg").html("The interval of time range is should be in 1 to 100 !");
		$("#resInterval").addClass("has-error");
		isIntervalValid = false;
	}
	else if (!numPattern.test(intValue))
	{
		$("#resInterval input").val("");
		$("#resIntervalErrorMsg").html("The interval of time range is inValid!");
		$("#resInterval").addClass("has-error");
		isIntervalValid = false;
	}
	else
	{
		$("#resIntervalErrorMsg").html("");
		$("#resInterval").removeClass("has-error");
	}
}

function checkStartTimeChange(resEl, name)
{
	var errorEl = resEl + "ErrorMsg";
	var conDiv = resEl + "Container";
	var isStartTimeValid = true;
	var startTimeValue = $(resEl).val();
	var starTi = null;

	if (!startTimeValue || startTimeValue == "")
	{
		$(errorEl).html("The "+ name +" is required");
		$(conDiv).addClass("has-error");
		isStartTimeValid = false;
	}
	else
	{
		starTi = new Date(Date.parse(startTimeValue));
		var tempTi = new Date();
		if (starTi.getTime() < tempTi.getTime())
		{
			$(errorEl).html(
					"The "+ name +" cannot be older than current time!");
			$(conDiv).addClass("has-error");
			isStartTimeValid = false;
		}
		else
		{
			$(errorEl).html("");
			$(conDiv).removeClass("has-error");
		}
	}	
	
}

function checkEndTimeChange(startEl, endEl, name, isSingle, isTime)
{
	var errorEl = startEl + "ErrorMsg";
	var conDiv = startEl + "Container";
	var isEndTimeValid = true;
	var endTimeValue = $(startEl).val();
	var starTi = null;
	if (!endTimeValue || endTimeValue == "")
	{
		$(errorEl).html("The "+ name +" is required");
		$(conDiv).addClass("has-error");
		isEndTimeValid = false;
	}
	else
	{
		var endTi = new Date(Date.parse(endTimeValue));
		var tempTi = new Date();
		tempTi.setHours(0);
		tempTi.setMinutes(0);
		tempTi.setSeconds(0);
		if (isSingle)
		{
			tempTi.setDate(tempTi.getDate() + 1);
			if (endTi.getTime() > tempTi.getTime())
			{
				$(errorEl).html("The "+ name +" cannot be older than today!");
				$(conDiv).addClass("has-error");
				isEndTimeValid = false;
			}

		}
		else if (!isTime)
		{
			tempTi.setMonth(tempTi.getMonth() + 3);
			if (endTi.getTime() > tempTi.getTime())
			{
				$(errorEl).html("The "+ name +" cannot be older than three months after today!");
				$(conDiv).addClass("has-error");
				isEndTimeValid = false;
			}
		}
		
		if (isEndTimeValid)
		{
			if (!$(endEl+'Container').hasClass('has-error'))
			{
				starTi = new Date(Date.parse($(endEl).val()));
				
				if (isSingle)
				{
					if (endTi.getTime() <= starTi.getTime())
					{
						$(errorEl).html(
								"The "+ name +" cannot be early than start date time!");
						$(conDiv).addClass("has-error");
						isEndTimeValid = false;
					}
				}
				else if (!isTime)
				{
					if (endTi.getTime() <= starTi.getTime())
					{
						$(errorEl).html(
								"The "+ name +" cannot be early than start date !");
						$(conDiv).addClass("has-error");
						isEndTimeValid = false;
					}
				}
				else if (endTi.getHours() < starTi.getHours ||endTi.getHours() == starTi.getHours && endTi.getMinutes() <= starTi.getMinutes())
				{
					$(errorEl).html(
							"The "+ name +" cannot be equals or early than start time !");
					$(conDiv).addClass("has-error");
					isEndTimeValid = false;
				}
			}
			else
			{
				$(errorEl).html(
						"The "+ name +" is depend on start date, please make sure start time is correct !");
				$(conDiv).addClass("has-error");
				isEndTimeValid = false;
			}
		}

		
		if (isEndTimeValid)
		{
			$(errorEl).html("");
			$(conDiv).removeClass("has-error");
		}
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
			forceParse: 0
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
loadMeetingRooms();
