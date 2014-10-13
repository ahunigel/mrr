
var mrObj = [];
var floorOptions = [];
var numPattern = /^\d+$/;
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
			option = new Option(data[i].name, data[i].id);
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
 */
function getReservationType()
{
	var reservationType = $("#reservationType input:checked").val();
	if (reservationType == "SINGLE")
	{
		$("#recurrentChoice").addClass("hide");
		$("#singleChoice").removeClass("hide");
		$("#recurrentChoice").children().removeClass("has-error");
		$("#recurrentChoice").children().find(".help-block").html("");
	}
	else
	{
		$("#singleChoice").addClass("hide");
		$("#recurrentChoice").removeClass("hide");
		$("#resInterval").change(checkRecInterval);
		$("#ReservationPt").change(getRecurrentType);
		$("#recStartTimeContainer input[type='text']").change(function(){startTimeValidate("#recStartTime", "start time", false, true)});
		$("#recEndTimeContainer input[type='text']").change(function(){endTimeValidate("#recEndTime", "#recStartTime", "end time", false, true)});
		$("#recStartDateContainer input[type='text']").change(function(){startTimeValidate("#recStartDate", "start time", false, false)});
		$("#recEndDateContainer input[type='text']").change(function(){endTimeValidate("#recEndDate", "#recStartDate", "end time", false, false)});
		$("#singleChoice").children().removeClass("has-error");
		$("#singleChoice").children().find(".help-block").html("");
	}
	
	enableOrDisableSubmit(!$("#mrSubjectContainer").hasClass('has-error'));

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
	
	$("#singleChoice").children().removeClass("has-error");
	$("#singleChoice").children().find(".help-block").html("");
	$("#recurrentChoice").children().removeClass("has-error");
	$("#recurrentChoice").children().find(".help-block").html("");
	$("#editMRRForm").children().find(".help-block").html("");
	$("#editMRRForm").children().removeClass("has-error");
	$("#editMRRForm").children().find(".help-block").html("");
	$("#saveEditMRRBtn").attr("disabled",false);
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
	
	addMRR();
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
	var reservationType = $("#reservationType input:checked").val();
	if(reservationType == "SINGLE")
	{
	    startTimeValidate("#startTime", "start date time", true, false);
	    endTimeValidate("#endTime", "#startTime", "end date time", true, false);
	}
	else
	{
	    checkRecInterval();
	    startTimeValidate("#recStartTime", "start time", false, true);
	    endTimeValidate("#recEndTime", "#recStartTime", "end time", false, true);
	    startTimeValidate("#recStartDate", "start time", false, false);
	    endTimeValidate("#recEndDate", "#recStartDate", "end time", false, false);
	}
	if ($('#editMRRForm .has-error').length > 0)
	{
		e.preventDefault();
		return;
	}

	var resData = {};

	resData.meetingSubject = $("#meetingSubject").val();
	var mrValue = $("#mrrFloorMeetingRoom option:selected").text();
	resData.meetingRoom = {id:mrValue};
	resData.reservedPerson = {id:1};
	resData.reservationType = reservationType;
	if (reservationType == "SINGLE")
	{
		resData.startTime = new Date(Date.parse($('#startTime').val()));
		resData.endTime = new Date(Date.parse($('#endTime').val()));
	}
	else
	{

		resData.startTime = getDateWithoutTime($('#recStartDate').val());
		resData.endTime = getDateWithoutTime($('#recEndDate').val());
		resData.recurrentType=$("#ReservationPt input:checked").val();
		resData.recurrentInterval=$("#resInterval").val();
		resData.recurrentStartTime = getTimeMinutesWithoutDate($('#recStartTime').val());
		resData.recurrentEndTime = getTimeMinutesWithoutDate($('#recEndTime').val());
	}
	var xhr = new XMLHttpRequest();
	xhr.open('PUT', "ws/meetingroomReservation/reservation", true);
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

	// send the collected data as JSON
 
	xhr.onreadystatechange=function()
	{
		if (xhr.readyState==4 && xhr.status==200)
		{
			data = xhr.responseText;
			if (!data.id)
			{
				alert("The date time range of the meeting room reservation in conflict with others ,please rebook!");
			}
		}
	}
	xhr.send(JSON.stringify(resData));
}

function getRecurrentType(e)
{
  var recValue = $("#ReservationPt input:checked").val();
  if (recValue == "DAILY" || recValue == "DAILY_WORKDAY")
  {
	  $("#intervalLabel").html("day(s)");
  }
  else if (recValue == "WEEKLY")
  {
	  $("#intervalLabel").html("week(s)");
  }
  else if (recValue == "MONTHLY")
  {
	  $("#intervalLabel").html("month(s)");
  }
}

/**
 * Get the date without time.
 * @param dateStr the date string to process.
 * @returns the date without time.
 */
function getDateWithoutTime(dateStr)
{
	var date = null;
	if (dateStr != null && dateStr.length > 0)
	{
		date = new Date(Date.parse(dateStr));
	}
	else
	{
		date = new Date();
	}
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	
	return date;
}

/**
 * Get the minutes of time without date.
 * @param dateStr the date string to process.
 * @returns {Number} the minutes of time without date.
 */
function getTimeMinutesWithoutDate(dateStr)
{
	var date = new Date(Date.parse(dateStr));
	var minutes = date.getHours()*60;
	minutes+=date.getMinutes();
	
	return minutes;
}

/**
 * The function for add meeting room reservation.
 */
function addMRR()
{
	if (floorOptions.length < 1)
	{
		alert("The reservation cannot be shown due to there is no meeting room to choice, please contact administrator !");
		$("#addMRR").attr("data-toggle","hide");
		$("#addMRR").attr("disabled",true);
		return;
	}
	
	$("#mrrEditDialogHeader").html("Add Meeting Room Reservation");
}

function deleteMRR(mrrId)
{
	$("#delMRBtn").click(function(){
		var xhr = new XMLHttpRequest();
		 xhr.open("DELETE", "ws/meetingroomReservation/meetingRoom/"+id, true);
		 xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

		 // send the collected data as JSON
		 xhr.onreadystatechange=function()
		{
			if (xhr.readyState==4)
			{
				loadMyReservaion();
			}
		}
		 xhr.send();
	
	});
}

/**
 * The function for check the interval of reservation
 * is valid or not.
 */
function checkRecInterval()
{
	var isIntervalValid = true;
	var intValue = $("#resInterval").val();
	var msg = null;
	if (numPattern.test(intValue) && (intValue>100 || intValue < 1))
	{
		msg = "The value of time range is should be in 1 to 100 !";
		isIntervalValid = false;
	}
	else if (!numPattern.test(intValue))
	{
		msg = "The value of time range is inValid, it should be integer type!";
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
 * @param name the name of error message should be shown.
 * @param isSingle the flag for if it is single reservation.
 * @param isTime the flag for if it is time filed.
 */
function startTimeValidate(resEl, name, isSingle, isTime)
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
		if (isSingle)
		{
			tempTi.setSeconds(0);
			if (starTi.getTime() < tempTi.getTime())
			{
				msg = "The "+ name +" should be older than current date time!";
				isStartTimeValid = false;
			}
		}
		else if (!isTime && getDateWithoutTime(null).getTime() > starTi.getTime())
		{
			msg = "The "+ name +" should be older than current date!";
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
	    
	    if (isEndTimeValid)
	    {
	    	if (!$(startEl+'Container').hasClass('has-error')&& !isNaN(Date.parse($(startEl).val())))
	    	{
	    		starTi = new Date(Date.parse($(startEl).val()));
	    		
	    		if (isSingle)
	    		{
	    			if (endTi.getTime() <= starTi.getTime())
	    			{
	    				msg = "The "+ name +" cannot be early than start date time!";
	    				isEndTimeValid = false;
	    			}
	    			else if (endTi.getYear() != starTi.getYear()||endTi.getMonth() != starTi.getMonth()||endTi.getDate() != starTi.getDate())
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
	    			else if(endTi.getYear() == starTi.getYear()&&endTi.getMonth() == starTi.getMonth()&&endTi.getDate() == starTi.getDate())
	    			{
	    				msg = "The recurrent type of "+ name +" cannot be the same day as start date, it should be more than one day!";
	    				isEndTimeValid = false;
	    			}
	    		}
	    		else 
	    		{
	    			if (endTi.getHours() < starTi.getHours() ||endTi.getHours() == starTi.getHours() && endTi.getMinutes() <= starTi.getMinutes())
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
	$("#startTimeContainer input[type='text']").change(function(){startTimeValidate("#startTime", "start date time", true, false);});
	$("#endTimeContainer input[type='text']").change(function(){endTimeValidate("#endTime", "#startTime", "end date time", true, false)});
	$("#saveEditMRRBtn").click(submitMRR);
	$("#addMRR").click(addMRR);
	$("#cancelMRR").click(resetReservation);
	$("#mrrFloor").change(getMrFloorChange);
	
	$("#reservationType").click(getReservationType);
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
			forceParse: 0,
			pickerPosition:"top-right"
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

function getDateStrWithGivenTime(date, minutes)
{
	var hours = minutes % 60;
	minutes -= hours*60;
	date.setHours(hours);
	date.setMinutes(minutes);
	return date.format("yyyy/mm/dd   HH:ii P");
}

function getRecurrentTypeMsg(recValue, intervalValue)
{
	var msg = "Everry "
	  if (recValue == "DAILY" || recValue == "DAILY_WORKDAY")
	  {
		   msg += intervalValue + " day(s)";
	  }
	  else if (recValue == "WEEKLY")
	  {
		  msg += intervalValue + " week(s)";
	  }
	  else if (recValue == "MONTHLY")
	  {
		  msg += intervalValue + " month(s)";
	  }
	
	msg += " occurs";
}

function bookRoom(floor, mrId)
{
	$("#mrrFloor").val(floor);
	$("#mrrFloorMeetingRoom").html(mrObj[floor].data);
	$("#mrrFloorMeetingRoom").val(mrId);
	addMRR();
}

function getMrOperation(floor, mrId)
{
	return '<button  class="btn btn-primary" data-toggle="modal" data-backdrop="static" '
		+ 'data-keyboard="false" data-target="#meetingRoomReservationEdit" id="bookRoom('+ floor +','+ mrId +')">Book It</button>';
}

function getReservationOperation(mrr)
{
	return '<input type="button" class="btn btn-primary" data-toggle="modal" data-target="#meetingRoomReservationEdit" '
		+ 'value="edit" onclick="editMrrForm('+mrr+')"/> <input type="button" class="btn btn-danger" data-toggle="modal" '
		+ 'data-target="#MyModal1" value="delete" onclick="deleteMRR('+mrr.id+')"/>';
}

function getTodayStatus(items)
{
	return "not implemented!";
}

function loadAvaliableMeetingRoomStatus()
{
	$.get("ws/meetingroomReservation/reservation?"+Math.random(), function (mrData) {
		var mrTab=document.getElementById("mrReservation");
		mrTab.innerHTML="";
		for(var i=0;i<mrData.length;i++){
			var row=mrTab.insertRow(i);
			row.insertCell(0).innerHTML= mrData[i].meetingRoom.name;
			row.insertCell(1).innerHTML= mrData[i].meetingRoom.floor;
			row.insertCell(2).innerHTML= mrData[i].meetingRoom.location;
			row.insertCell(3).innerHTML= mrData[i].meetingRoom.seats;
			row.insertCell(4).innerHTML= mrData[i].meetingRoom.phoneExist;
			row.insertCell(5).innerHTML= mrData[i].meetingRoom.projectorExist;
			row.insertCell(6).innerHTML= getTodayStatus(mrData[i].items);
			row.insertCell(7).innerHTML= getMrOperation(mrData[i].meetingRoom.floor, mrData[i].meetingRoom.id);
		}
	  });

}

function loadAllMeetingRoomStatus()
{
	$.get("ws/meetingroomReservation/reservation?"+Math.random(), function (mrData) {
		var mrTab=document.getElementById("allMeetingRoomStatus");
		mrTab.innerHTML="";
		for(var i=0;i<mrData.length;i++){
			var row=mrTab.insertRow(i);
			row.insertCell(0).innerHTML= mrData[i].meetingRoom.name;
			row.insertCell(1).innerHTML= mrData[i].meetingRoom.floor;
			row.insertCell(2).innerHTML= mrData[i].meetingRoom.location;
			row.insertCell(3).innerHTML= mrData[i].meetingRoom.seats;
			row.insertCell(4).innerHTML= mrData[i].meetingRoom.phoneExist;
			row.insertCell(5).innerHTML= mrData[i].meetingRoom.projectorExist;
			row.insertCell(6).innerHTML= getTodayStatus(mrData[i].items);
			row.insertCell(7).innerHTML= getMrOperation(mrData[i].meetingRoom.floor, mrData[i].meetingRoom.id);
		}
	  });

}

function loadMyReservaion()
{
	$.get("ws/meetingroomReservation/user/"+1, function (mrrData) {
		var mrTab=document.getElementById("myReservation");
		mrTab.innerHTML="";
		for(var i=0;i<mrrData.length;i++){
			var row=mrTab.insertRow(i);
			row.insertCell(0).innerHTML= mrrData[i].meetingSubject.substring(0,20);
			if(mrrData[i].reservationType == "SINGLE")
			{
				row.insertCell(1).innerHTML= mrrData[i].startTime.format("yyyy/mm/dd   HH:ii P");
				row.insertCell(2).innerHTML= mrrData[i].endTime.format("yyyy/mm/dd   HH:ii P");
				row.insertCell(3).innerHTML=mrrData[i].reservationType;
				row.insertCell(4).innerHTML='Only once';
			}
			else
			{
				row.insertCell(1).innerHTML= getDateStrWithGivenTime(mrrData[i].startTime, mrrData[i].recurrentStartTime);
				row.insertCell(2).innerHTML= getDateStrWithGivenTime(mrrData[i].endTime, mrrData[i].recurrentEndTime);
				row.insertCell(3).innerHTML= mrrData[i].reservationType;
				row.insertCell(4).innerHTML= getRecurrentTypeMsg(mrrData[i].reservationType, mrrData[i].recurrentInterval);

			}
			
			row.insertCell(5).innerHTML= mrrData[i].meetingRoom.name;
			row.insertCell(1).innerHTML= mrrData[i].meetingRoom.floor;
			row.insertCell(2).innerHTML= mrrData[i].meetingRoom.location;
			row.insertCell(3).innerHTML= mrrData[i].meetingRoom.seats;
			row.insertCell(4).innerHTML= mrrData[i].meetingRoom.phoneExist;
			row.insertCell(5).innerHTML= mrrData[i].meetingRoom.projectorExist;
			row.insertCell(6).innerHTML= getReservationOperation(mrrData[i]);
		}
	  });
}

loadAvaliableMeetingRoomStatus();

initMRResElement();
loadMeetingRooms();
