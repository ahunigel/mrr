
var mrObj = [];
var floorOptions = [];
var numPattern = /^\d+$/;
var myReservations = {};
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
	var reservationType = $("input[name='ReservationType']:checked").val();
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
		$("#ReservationPt").change(function(){
			 var recValue = $("#ReservationPt input:checked").val();
			getRecurrentType(recValue)});
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
 * @param mrrId the id of reservation for process.
 */
function editMRR(mrrId)
{
	var res = myReservations[mrrId];
	$("#mrrId").val(mrrId);
	$("#mrSubject").val(res.meetingSubject);
	$("#mrrFloor").val(res.meetingRoom.floor);
	$("#mrrFloorMeetingRoom").html(mrObj[res.meetingRoom.floor].data);
	$("#mrrFloorMeetingRoom").val(res.meetingRoom.id);
	if (res.reservationType == "SINGLE")
	{
		$("input:radio[value='SINGLE']").prop("checked","checked");
		$("#recurrentChoice").addClass("hide");
		$("#singleChoice").removeClass("hide");
		$("#startTimeContainer input").val(getDateStrWithGivenTime(res.startTime, null));
		$("#endTimeContainer input").val(getDateStrWithGivenTime(res.endTime, null));
	}
	else
	{
		$("input:radio[value='RECURRENT']").prop("checked","checked");
		$("#singleChoice").addClass("hide");
		$("#recurrentChoice").removeClass("hide");
		$("#recStartTimeContainer input").val(getDateStrOrtTimeStr(null, res.recurrentStartTime));
		$("#recEndTimeContainer input").val(getDateStrOrtTimeStr(null, res.recurrentEndTime));
		getRecurrentType(res.recurrentType);
		$("input:radio[value='" +res.recurrentType+ "']").prop("checked","checked");
		$('#resInterval').val(res.recurrentInterval);
		$("#recStartDateContainer input").val(getDateStrOrtTimeStr(res.startTime, null));
		$("#recEndDateContainer input").val(getDateStrOrtTimeStr(res.endTime, null));
	}
	
	addMRR();
}

function getDateStrOrtTimeStr(date, minutes)
{
	var dateStr = "";
	if (date != null)
	{
		if (typeof date=="string")
		{
			date = new Date(Date.parse(date));
		}
		dateStr = date.getFullYear();
		dateStr += "/" + formatTimeStr(date.getMonth() + 1);
		dateStr += "/" + formatTimeStr(date.getDate());
	}
	else if (minutes != null)
	{
		var hours = parseInt(minutes / 60);
		var minutes = minutes % 60;
		var tm = hours < 12 ? "AM" : "PM";
		dateStr += formatTimeStr(hours%12);
		dateStr += ":" + formatTimeStr(minutes);
		dateStr += " " + tm;
	}
	
	return dateStr;
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
	e.preventDefault();
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
		return;
	}

	var resData = {};
	if ($("#mrrId").val() != null && $("#mrrId").val().length > 0)
	{
		resData.id = $("#mrrId").val();
	}
	resData.meetingSubject = $("#mrSubject").val();
	var mrValue = $("#mrrFloorMeetingRoom option:selected").val();
	resData.meetingRoom = {id:mrValue};
	resData.reservedPerson = {id:1};
	resData.reservationType = reservationType;
	if (reservationType == "SINGLE")
	{
		resData.startTime = new Date(Date.parse($('#startTime').val()));
		resData.startTime.setMinutes(resData.startTime.getMinutes()+resData.startTime.getTimezoneOffset());
		resData.endTime = new Date(Date.parse($('#endTime').val()));
		resData.endTime.setMinutes(resData.endTime.getMinutes()+resData.endTime.getTimezoneOffset());

	}
	else
	{

		resData.startTime = getDateWithoutTime($('#recStartDate').val());
		resData.startTime.setMinutes(resData.startTime.getMinutes()+resData.startTime.getTimezoneOffset());
		resData.endTime = getDateWithoutTime($('#recEndDate').val());
		resData.endTime.setMinutes(resData.endTime.getMinutes()+resData.endTime.getTimezoneOffset());
		resData.recurrentType=$("#ReservationPt input:checked").val();
		resData.recurrentInterval=$("#resInterval").val();
		resData.recurrentStartTime = getTimeMinutesWithoutDate($('#recStartTime').val());
		resData.recurrentEndTime = getTimeMinutesWithoutDate($('#recEndTime').val());
	}
	var xhr = new XMLHttpRequest();
	if (resData.id)
	{
		xhr.open('POST', "ws/meetingroomReservation/reservation", true);
	}
	else
	{
		xhr.open('PUT', "ws/meetingroomReservation/reservation", true);
	}
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

	// send the collected data as JSON
 
	xhr.onreadystatechange=function()
	{
		if (xhr.readyState==4 && xhr.status==200)
		{
			$("#cancelMRR").click();
			
			if (xhr.responseText != "true")
			{
				alert("The date time range of the meeting room reservation in conflict with others ,please rebook!");
			}
			else
			{
				/*var row = null;
				if ($("#myReservation").find("#"+data.id).length > 0)
				{
					row = $("#myReservation").find("#"+data.id);
					fillOrCreateTableCell(row, data, false);
				}
				else
				{
					row =$("#myReservation").get(0).insertRow(0);
					fillOrCreateTableCell(row, data, false);
				}*/
			}
		}
	}
	xhr.send(JSON.stringify(resData));
}

function getRecurrentType(recValue)
{
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
		 xhr.open("DELETE", "ws/meetingroomReservation/meetingRoom/"+mrrId, true);
		 xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

		 // send the collected data as JSON
		 xhr.onreadystatechange=function()
		{
			if (xhr.readyState==4)
			{
				$("#myReservation").find("#"+mrrId).remove();
				
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

function formatTimeStr(value)
{
	if (value < 10)
	{
		value ='0' + value;
	}
	
	return value;
}

function getDateStrWithGivenTime(date, minutes)
{
	
	if (typeof date=="string")
	{
		date = new Date(Date.parse(date));
	}
	var dateStr = date.getFullYear();
	dateStr += "/" + formatTimeStr(date.getMonth() + 1);
	dateStr += "/" + formatTimeStr(date.getDate());
	if (minutes != null)
	{
		var hours = parseInt(minutes / 60);
		minutes = minutes % 60;
		date.setHours(hours);
		date.setMinutes(minutes);
	}
	var tm = hours < 12 ? "AM" : "PM";
	dateStr += "  " + formatTimeStr(date.getHours()%12);
	dateStr += ":" + formatTimeStr(date.getMinutes());
	dateStr += " " + tm;
	return dateStr;
}

function getRecurrentTypeMsg(recValue, intervalValue)
{
	var msg = "Only once";
	if (recValue != null && intervalValue != null)
	{
		msg = "Everry "
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
	
	return msg;
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

function getReservationOperation(mrrId)
{
	return '<input type="button" class="btn btn-primary" data-toggle="modal" data-target="#meetingRoomReservationEdit" '
		+ 'value="edit" onclick="editMRR('+mrrId+')"/> <input type="button" class="btn btn-danger" data-toggle="modal" '
		+ 'data-target="#MyModal1" value="delete" onclick="deleteMRR('+mrrId+')"/>';
}

function getTodayStatus(items)
{
	var el = $("<canvas id='tmCanvas' width='288' height='30' ></canvas>");
	var ctx = el.get(0).getContext("2d");
	var y1 = 2;
	var y2 = 16;
	var x1 = 0;
	var x2 = 0;
	
	function drawBox(x1, x2, isUsed)
	{
		if (isUsed)
		{
			ctx.fillStyle = "#DF0101";
		}
		else
		{
			ctx.fillStyle = "#00FF00";
		}
		ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
	}
	
	function getXaxisValue(date)
	{
		var minutes = 0;
		if (typeof date=="string")
		{
			date = new Date(Date.parse(date));
			minutes += date.getHours()*60 + date.getMinutes();
			
		}
		
		return parseInt(minutes/5);
	}
	
	x2 = 288;
	drawBox(x1, x2, false);
	if (items && items.length > 0)
	{
		for (var i= 0; i < items.length; i++)
		{
			x1 = getXaxisValue(items[i].startTime);
			x2 = getXaxisValue(items[i].endTime);
			drawBox(x1, x2, true);
		}
		
	}
	
	// draw the time shaft.
	ctx.fillStyle = "#0E0B0B";
	ctx.fillText("00:00 AM", 0, 24);
	ctx.fillText("12:00 PM", 240, 24);
	  
	return el.get(0);
}



function loadAvaliableMeetingRoomStatus()
{
	$.get("ws/meetingroomReservation/reservation?"+Math.random(), function (mrData) {
		var mrTab=document.getElementById("mrReservation");
		mrTab.innerHTML="";
		var index = null;
		var row = null;
		for(var i=0;i<mrData.length;i++){
			row=mrTab.insertRow(i);
			index = 0;
			row.insertCell(index++).innerHTML= mrData[i].meetingRoom.name;
			row.insertCell(index++).innerHTML= mrData[i].meetingRoom.floor;
			row.insertCell(index++).innerHTML= mrData[i].meetingRoom.location;
			row.insertCell(index++).innerHTML= mrData[i].meetingRoom.seats;
			row.insertCell(index++).innerHTML= mrData[i].meetingRoom.phoneExist;
			row.insertCell(index++).innerHTML= mrData[i].meetingRoom.projectorExist;
			row.insertCell(index++).appendChild(getTodayStatus(mrData[i].timeIntervalItems));
			row.insertCell(index++).innerHTML= getMrOperation(mrData[i].meetingRoom.floor, mrData[i].meetingRoom.id);
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
			row.insertCell(6).innerHTML= getTodayStatus(mrData[i].timeIntervalItems);
			row.insertCell(7).innerHTML= getMrOperation(mrData[i].meetingRoom.floor, mrData[i].meetingRoom.id);
		}
	  });

}

function loadMyReservaion()
{
	$.get("ws/meetingroomReservation/user/"+1, function (mrrData) {
		var mrTab=$("#myReservation").get(0);
		mrTab.innerHTML="";
		for(var i=0;i<mrrData.length;i++){
			myReservations[mrrData[i].id] = mrrData[i];
			var row=mrTab.insertRow(i);
			fillOrCreateTableCell(row, mrrData[i], true);
		}
	  });
}

function fillOrCreateTableCell(row, mrr, isNewData)
{
	var index = 0;
	if (isNewData)
	{
		row.id=mrr.id;
		row.insertCell(index++).innerHTML= mrr.meetingSubject.substring(0,20);
		row.insertCell(index++).innerHTML= getDateStrWithGivenTime(mrr.startTime, mrr.recurrentStartTime);
		row.insertCell(index++).innerHTML= getDateStrWithGivenTime(mrr.endTime, mrr.recurrentEndTime);
		row.insertCell(index++).innerHTML= mrr.reservationType;
		row.insertCell(index++).innerHTML= getRecurrentTypeMsg(mrr.recurrentType, mrr.recurrentInterval);
		row.insertCell(index++).innerHTML= mrr.meetingRoom.name;
		row.insertCell(index++).innerHTML= mrr.meetingRoom.floor;
		row.insertCell(index++).innerHTML= mrr.meetingRoom.location;
		row.insertCell(index++).innerHTML= mrr.meetingRoom.seats;
		row.insertCell(index++).innerHTML= mrr.meetingRoom.phoneExist;
		row.insertCell(index++).innerHTML= mrr.meetingRoom.projectorExist;
		row.insertCell(index++).innerHTML= getReservationOperation(mrr.id);
	}
	else
	{
		row.getCell(index++).innerHTML= mrr.meetingSubject.substring(0,20);
		row.getCell(index++).innerHTML= getDateStrWithGivenTime(mrr.startTime, mrr.recurrentStartTime);
		row.getCell(index++).innerHTML= getDateStrWithGivenTime(mrr.endTime, mrr.recurrentEndTime);
		row.getCell(index++).innerHTML= mrr.reservationType;
		row.getCell(index++).innerHTML= getRecurrentTypeMsg(mrr.recurrentType, mrr.recurrentInterval);
		row.getCell(index++).innerHTML= mrr.meetingRoom.name;
		row.getCell(index++).innerHTML= mrr.meetingRoom.floor;
		row.getCell(index++).innerHTML= mrr.meetingRoom.location;
		row.getCell(index++).innerHTML= mrr.meetingRoom.seats;
		row.getCell(index++).innerHTML= mrr.meetingRoom.phoneExist;
		row.getCell(index++).innerHTML= mrr.meetingRoom.projectorExist;
		row.getCell(index++).innerHTML= getReservationOperation(mrr.id);
	}
}

loadAvaliableMeetingRoomStatus();

initMRResElement();
loadMeetingRooms();
