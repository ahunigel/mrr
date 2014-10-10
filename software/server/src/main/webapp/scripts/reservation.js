var reservationType = "SINGLE";
var mrObj = [];
var floorOptions = [];
var numPattern = /^\d+$/;
var startTimer = {};
var endTimer = {};

/**
 * The function for load meeting rooms and 
 * initial floor and meeting room options for add or edit reservation.
 */
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
			//Sort the floors by floor number.
			floorOptions.sort(function(a,b)
			{
				if (a.value > b.value)
				{
					return 1;
				}
				if (a.value < b.value)
				{
					return -1;
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

/**
 * The function for meeting room floor change.
 */
function getMrFloorChange()
{
	var fValue = this[this.selectedIndex].value;
	//Change the meeting room options by floor number.
	$("#mrrFloorMeetingRoom").html(mrObj[fValue].data);
}

/**
 * The function for handle the subject of meeting room reservation
 * and check if the value is valid or not.
 */
function mrrSubjectChange()
{
	var isSubjectValid = true;
	var subValue = $("#mrSubject").val();
	var msg = "";
	if (!subValue || subValue == "")
	{
		msg = "The meeting room reservation subject is required and cannot be empty";
		isSubjectValid = false;
	}
	else if (subValue.length < 6 || subValue.length > 300)
	{
		msg = "The meeting room reservation subject must be more than 6 and less than 300 characters long";
		isSubjectValid = false;
	}	
	
	addOrRemoveErrorMsg(isSubjectValid, "#mrSubject", msg);
	enableOrDisableSubmit(isSubjectValid);			
}

/**
 * The function for handle single or recurrent type reservation
 * and switch the UI by reservation type.
 * @param e the default event.
 */
function getReservationTypeTimeRange(e)
{
	reservationType = e.currentTarget.value;
	if (reservationType == "SINGLE")
	{
		$("#recurrentChoice").addClass("hide");
		$("#singleChoice").removeClass("hide");
		$("#startTimeContainer input[type='text']").bind("change", function(){startTimeValidate("#startTime", "start date time",false);});
		$("#endTimeContainer input[type='text']").bind("change", function(){endTimeValidate("#endTime", "#startTime", "end date time", true, false)});
		$("#resInterval").removeAttr("change");
		$("#recStartTimeContainer input[type='text']").unbind("change");
		$("#recEndTimeContainer input[type='text']").unbind("change");
		$("#recStartDateContainer input[type='text']").unbind("change");
		$("#recEndDateContainer input[type='text']").unbind("change");
		$("#recurrentChoice").children().removeClass(".has-error");
	}
	else
	{
		$("#singleChoice").addClass("hide");
		$("#recurrentChoice").removeClass("hide");
		$("#resInterval").bind("change", checkRecInterval);
		$("#recStartTimeContainer input[type='text']").bind("change", function(){startTimeValidate("#recStartTime", "start time",true)});
		$("#recEndTimeContainer input[type='text']").bind("change", function(){endTimeValidate("#recEndTime", "#recStartTime", "end time", false, true)});
		$("#recStartDateContainer input[type='text']").bind("change", function(){startTimeValidate("#recStartDate", "start time",false)});
		$("#recEndDateContainer input[type='text']").bind("change", function(){endTimeValidate("#recEndDate", "#recStartDate", "end time", false, false)});
		$("#startTimeContainer input[type='text']").unbind("change");
		$("#endTimeContainer input[type='text']").unbind("change");
		$("#singleChoice").children().removeClass(".has-error");
	}

}

/**
 * The function for reset reservation form.
 */
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

/**
 * The function for edit reservation and fill the reservation
 * information into form.
 * @param res the reservation for process.
 */
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

/**
 * The function for enable or disable submit button.
 * @param isValid the flag for enable or disable submit button.
 */
function enableOrDisableSubmit(isValid)
{
	if (isValid && $('#editMRRForm .has-error').length == 0)
	{
		$("#saveEditMRRBtn").attr("disabled",false);
	}
	else
	{
		$("#saveEditMRRBtn").attr("disabled",true);
	}
}

/**
 * The function for add or remove error message and class.
 * @param isValid the flag for add or remove error message.
 * @param resEl the element of reservation for process.
 * @param msg the message for display.
 */
function addOrRemoveErrorMsg(isValid, resEl, msg)
{
	var errorEl = resEl + "ErrorMsg";
	var conDiv = resEl + "Container";
	$(errorEl).html(msg);
	if (!isValid)
	{
		$(conDiv).addClass("has-error");
	}
	else
	{
		$(conDiv).removeClass("has-error");
	}
}

/**
 * The function for submit meeting room reservation
 * and load meeting room list.
 * @param e the default event.
 */
function submitMRR(e)
{
	mrrSubjectChange();
	if(reservationType == "SINGLE")
	{
	    startTimeValidate("#startTime", "start date time", false);
	    endTimeValidate("#endTime", "#startTime", "end date time", true, false);
	}
	else
	{
	    checkRecInterval();
	    startTimeValidate("#recStartTime", "start time");
	    endTimeValidate("#recEndTime", "#recStartTime", "end time", false, true);
	    startTimeValidate("#recStartDate", "start time");
	    endTimeValidate("#recEndDate", "#recStartDate", "end time", false, false);
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
	startTimer = null;
	endTimer = null;
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

/**
 * The function for add meeting room reservation.
 */
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

/**
 * The function for check the interval of reservation
 * is valid or not.
 */
function checkRecInterval()
{
	var isIntervalValid = true;
	var intValue = $("#resInterval input").val();
	var msg = null;
	if (numPattern.test(intValue) && intValue>100 || intValue < 1)
	{
		$("#resInterval input").val("");
		msg = "The interval of time range is should be in 1 to 100 !";
		isIntervalValid = false;
	}
	else if (!numPattern.test(intValue))
	{
		$("#resInterval input").val("");
		msg = "The interval of time range is inValid!";
		isIntervalValid = false;
	}
	else
	{
		msg = "";
	}
	
	addOrRemoveErrorMsg(isIntervalValid, "#resInterval", msg);
	enableOrDisableSubmit(isIntervalValid);
}

/**
 * The function for check the start time/date is valid or not.
 * @param resEl the start time/date element of reservation for process.
 * @param oldValue the old value of start time/date to process.
 * @param name the name of error message should be shown.
 */
function startTimeValidate(resEl, name, isTime)
{
	var isStartTimeValid = true;
	var startTimeValue = $(resEl).val();
	var starTi = null;
	var msg = "";
	
	if (!startTimeValue || startTimeValue == "")
	{
		msg = "The "+ name +" is required";
		isStartTimeValid = false;
	}
	else
	{	
		var tempTi = new Date();
		starTi = new Date(Date.parse(startTimeValue));
		if (isTime)
		{
			if (starTi.getHours() < tempTi.getHours() || starTi.getHours() == tempTi.getHours() && starTi.getMinutes() < tempTi.getMinutes())
			{
				msg = "The "+ name +" should be older than current time!";
				isStartTimeValid = false;
			}
		}
		else if (starTi.getTime() < tempTi.getTime())
		{
			msg = "The "+ name +" should be older than current date time!";
			isStartTimeValid = false;
		}
		
	}
	
	addOrRemoveErrorMsg(isStartTimeValid, resEl, msg);
	enableOrDisableSubmit(isStartTimeValid);
}

/**
 * The function for check if the end time/date is valid or not.
 * @param endEl the end time/date element of reservation for process.
 * @param startEl the start time/date element of reservation for process.
 * @param name  the name of error message should be shown.
 * @param isSingle the flag for check if it is single reservation.
 * @param isTime the flag for check if it is time without date.
 */
function endTimeValidate(endEl, startEl, name, isSingle, isTime)
{
	var isEndTimeValid = true;
	var endTimeValue = $(endEl).val();
	var starTi = null;
	var msg = "";

	if (!endTimeValue || endTimeValue == "")
	{
		msg = "The "+ name +" is required";
		isEndTimeValid = false;
	}
	else
	{
		var endTi = new Date(Date.parse(endTimeValue));
	    if (!isSingle && !isTime)
		{
			var tempTi = new Date();
			tempTi.setHours(0);
			tempTi.setMinutes(0);
			tempTi.setSeconds(0);
			tempTi.setMonth(tempTi.getMonth() + 3);
			if (endTi.getTime() > tempTi.getTime())
			{
				msg = "The "+ name +" cannot be older than three months after today!";
				isEndTimeValid = false;
			}
		}
	    else if (!$(startEl+'Container').hasClass('has-error')&& !isNaN(Date.parse($(startEl).val())))
		{
			starTi = new Date(Date.parse($(startEl).val()));
			
			if (isSingle)
			{
				if (endTi.getTime() <= starTi.getTime())
				{
					msg = "The "+ name +" cannot be early than start date time!";
					isEndTimeValid = false;
				}
				else if (endTi.getDate() != starTi.getDate())
				{
					msg = "The date range of single reservation cannot be more than one day!";
					isEndTimeValid = false;
				}
			}
			else if (!isTime)
			{
				if (endTi.getTime() <= starTi.getTime())
				{
					msg = "The "+ name +" cannot be early than start date !";
					isEndTimeValid = false;
				}
			}
			else 
			{
				if (endTi.getHours() < starTi.getHours ||endTi.getHours() == starTi.getHours && endTi.getMinutes() <= starTi.getMinutes())
				{
					msg = "The "+ name +" cannot be equals or early than start time !";
					isEndTimeValid = false;
				}
			}
		}
		else
		{
			msg = "The "+ name +" is depend on start date, please make sure start time is correct !";
			isEndTimeValid = false;
		}
	}
	
	addOrRemoveErrorMsg(isEndTimeValid, endEl, msg);
	enableOrDisableSubmit(isEndTimeValid);
	
}

/**
 * The function for initial meeting room reservation elements
 * such as date time picker and the elements of reservation form.
 */
function initMRResElement()
{
	$("#mrSubject").change(mrrSubjectChange);
	$("#startTimeContainer input[type='text']").change(function(){startTimeValidate("#startTime", "start date time",false);});
	$("#endTimeContainer input[type='text']").change(function(){endTimeValidate("#endTime", "#startTime", "end date time", true, false)});
		
	$("#addMRR").click(addMRR);
	$("#cancelMRR").click(resetReservation);
	$("#mrrFloor").change(getMrFloorChange);
	$("#singleRes").click(getReservationTypeTimeRange);
	$("#recurrentRes").click(getReservationTypeTimeRange);
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

initMRResElement();
loadMeetingRooms();
