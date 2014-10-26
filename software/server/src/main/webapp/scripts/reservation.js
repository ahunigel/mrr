
var mrObj = [];
var floorOptions = [];
var numPattern = /^\d+$/;
var myReservations = null;
var errMsgs = {
		singleStartTime1:"The appointment date is required",
		singleStartTime2:"The appointment date is invalid",
		singleStartTime3:"The appointment date cannot be earlier than current date!",
		timeRangeError:"The start time cannot be equals end date time!",
		startTimeError:"The start date time cannot be equals or earlier than current date time!",
		recurrentStartDate1:"The start date is required",
		recurrentStartDate2:"The start date is invalid",
		recurrentStartDate3:"The start date should be older than current date!",
		recurrentEndDate1:"The end date is required",
		recurrentEndDate2:"The end date is invalid",
		recurrentEndDate3:"The end date cannot be equals or early than start date!",
		recurrentEndDate4:"The date range of recurrent reservation cannot be more than three months!",
		recurrentEndDate5:"The end date is depend on start date, please make sure start date is correct !",
		intervalInvalid:"The value of time range is should be in 1 to 100 !",
		integerInvalid:"The value of time range is inValid, it should be integer type!",
		commonWarnTitle:"Warning",
		warnMsgTitle:"Special meeting room Warning!",
		warnMsg:"The meeting room reservation can be canceled by admin officer If admin officer also want to use" +
				"the meeting room at the same time, press ok to continue, press cancel to select other meeting room.",
		specialWarnMsg:"This a special meeting room reservation and you will force cancel other's conflict reservation of this" +
				" meeting room, press ok to continue, press cancel to select other meeting room.",
		addMRRWarnMsgTitle:"Failed Message",
		addMRRWarnMsg:"The date time range of the meeting room reservation in conflict with others ,please rebook!",
		mrUnvaliableWarnMsg:"The reservation cannot be shown due to there is no meeting room to choice, please contact administrator !",
		mrNoPrivilegeWarnMsg:"You don't have the privilege to do this operation!",
		mrEditWarnMsg:"The reservation is going/expired, you cannot edit it!",
		mrEditOldDayWarnMsg:"Yon cannot add or edit reservation the day before today!",
		mrEditUnvaliableTodayWarnMsg:"There is no avaliable time range for add reservation today!"
}
var datePattern = /2\d{3}\/[0-1]\d\/[0-3]\d/;
var timeRangeData = {};
var colorArr = {blue:"#00FF00", green:"#2E2EFE",red:"#DF0101",grey:"#BDBDBD",black:"#000000",white:"#FFFFFF",yellow:"#FFFF00",lightGreen:"#2EFEF7"};
var calMrId = null;
var selectedDate = null;
var smallbar = $("#small_bar");
var arrbtn = $("#long_bar span");
var minP = $("#startTime");
var maxP = $("#endTime");
var minTime = parseInt(parseTimeStr(minP.text()));
var maxTime = parseInt(parseTimeStr(maxP.text()));
var total = maxTime - minTime;
var maxwidth = 400;
var isAvaliableView = true;
/**
 * The function for load meeting rooms and 
 * initial floor and meeting room options for add or edit reservation.
 */
function loadMeetingRooms()
{
	if (!mrData)
	{
		mrData = {};
		$.get("ws/meetingrooms?"+Math.random(), function (data) {
			
			for(var i=0;i<data.length;i++)
			{
				mrData[data[i].id] = data[i];
			}
			processMeetingRoomData();
		});
	}
	else
	{
		processMeetingRoomData();
	}
}

function processMeetingRoomData()
{
	var option = null;
	
	for(var i in mrData)
	{
		var fl = null;
		option = new Option(mrData[i].name, mrData[i].id);
		if (!mrObj[mrData[i].floor])
		{
			fl = new Option(mrData[i].floor, mrData[i].floor);
			mrObj[mrData[i].floor] = {id:mrData[i].floor,data:[]};
		}
		
		if (fl)
		{
			floorOptions.push(fl);
		}
		mrObj[mrData[i].floor].data.push(option);
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
		$(".recurrent-group").removeClass("has-error");
		$(".recurrent-group").children().find(".help-block").html("");
		$(".recurrent-group").addClass("hide");
		$("#dateLabel").text("Date");
		$("#startDateContainer input[type='text']").change(function(){startTimeValidate("#startDate", null, true)});
	}
	else
	{
		$("#dateLabel").text("Start Date");
		$(".recurrent-group").removeClass("hide");
		$("#resInterval").change(checkRecInterval);
		$("#ReservationPt").change(function(){
			 var recValue = $("#ReservationPt input:checked").val();
			getRecurrentType(recValue)});
		$("#startDateContainer input[type='text']").change(function(){startTimeValidate("#recEndDate", "#startDate", false)});

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
				input.checked = true;
				getReservationType();
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
	setStartOrEndTime(480,true);
	setStartOrEndTime(1080,false);
	$("#editMRRForm").children().find(".help-block").html("");
	$("#editMRRForm").children().removeClass("has-error");
	$("#editMRRForm").children().find(".help-block").html("");
	$("#saveEditMRRBtn").prop("disabled",false);
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
	$("#startDateContainer input").val(getDateStrOrTimeStr(res.startTime, null));
	if (res.reservationType == "SINGLE")
	{
		setStartOrEndTime(getTimeMinutesWithoutDate(res.startTime), true);
		setStartOrEndTime(getTimeMinutesWithoutDate(res.endTime), false);
	}
	else
	{
		$("input:radio[value='RECURRENT']").prop("checked","checked");
		setStartOrEndTime(res.recurrentStartTime, true);
		setStartOrEndTime(res.recurrentEndTime, false);
		getReservationType();
		getRecurrentType(res.recurrentType);
		$("input:radio[value='" +res.recurrentType+ "']").prop("checked","checked");
		$('#resInterval').val(res.recurrentInterval);
		$("#recEndDateContainer input").val(getDateStrOrTimeStr(res.endTime, null));
		
	}
	
	addMRR();
}

/**
 * Get the formated date or time string.
 * @param date the date to process.
 * @param minutes the minutes to process.
 * @returns {String} the formated date or time string.
 */
function getDateStrOrTimeStr(date, minutes)
{
	var dateStr = "";
	if (date != null)
	{
		var tempDate = date;
		if (typeof date=="string")
		{
			tempDate = new Date(Date.parse(date));
			tempDate.setMinutes(tempDate.getMinutes()+tempDate.getTimezoneOffset());
		}
		else if (typeof date == "number")
		{
			tempDate = new Date(date);
		}
		
		dateStr = tempDate.getFullYear();
		dateStr += "/" + formatTimeStr(tempDate.getMonth() + 1);
		dateStr += "/" + formatTimeStr(tempDate.getDate());
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
		$("#saveEditMRRBtn").prop("disabled",false);
	}
	else
	{
		$("#saveEditMRRBtn").prop("disabled",true);
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
	    startTimeValidate("#startDate", null, true);
	}
	else
	{
	    checkRecInterval();
	    startTimeValidate("#startDate", "#recEndDate", false);
	    endTimeValidate("#recEndDate", "#startDate");
	}
	if ($('#editMRRForm .has-error').length > 0)
	{
		return;
	}
	
	if (mrData[$("#mrrFloorMeetingRoom option:selected").val()].specailRoom)
	{
		var msg = errMsgs.warnMsg;
		if (currentUser.role=="ADMIN")
		{
			msg = errMsgs.specialWarnMsg;
		}
		
	  	showDialog(errMsgs.warnMsgTitle, msg, false);
	  	$("#errorDialog #confirmBtn").click(function(){
	  		 processDataAfterVerified();
	  	});
	}
	else
	{
		 processDataAfterVerified();
	}
	
}

function showDialog(title, msg, isHiddenCancelBtn)
{
	$("#errorDialog .modal-header h4").html(title);
	$("#errorDialog .container h5").html(msg).css({"height":"30px","width":"550px"});
	if (isHiddenCancelBtn)
	{
		$("#errorDialog .btn-default").hide();
		$("#errorDialog #confirmBtn").click(function(){
			$("#errorDialog .btn-default").show();
	  	});
	}
	$("#errorDialog").modal('show');
}

function processDataAfterVerified()
{
	var resData = {};
	if ($("#mrrId").val() != null && $("#mrrId").val().length > 0)
	{
		resData.id = $("#mrrId").val();
	}
	resData.meetingSubject = $("#mrSubject").val();
	var mrValue = $("#mrrFloorMeetingRoom option:selected").val();
	var reservationType = $("#reservationType input:checked").val();
	resData.meetingRoom = mrData[mrValue];
	resData.reservedPerson = currentUser;
	resData.reservationType = reservationType;
	if (reservationType == "SINGLE")
	{
		var startDateTimeStr = $("#startDateContainer input[type='text']").val() + " "+ $("#startTime").text();
		var endDateTimeStr = $("#startDateContainer input[type='text']").val() +" " +$("#endTime").text();
		resData.startTime = new Date(Date.parse(startDateTimeStr));
		resData.endTime = new Date(Date.parse(endDateTimeStr));

	}
	else
	{

		resData.startTime = getDateWithoutTime($("#startDateContainer input[type='text']").val());
		resData.endTime = getDateWithoutTime($("#recEndDateContainer input[type='text']").val());
		resData.recurrentType=$("#ReservationPt input:checked").val();
		resData.recurrentInterval=$("#resInterval").val();
		resData.recurrentStartTime = parseTimeStr($("#startTime").text());
		resData.recurrentEndTime = parseTimeStr($("#endTime").text());
	}
	
	var urlType = "PUT";
	if (resData.id)
	{
		urlType = "POST";
	}
	
	$.ajax({ 
		type: urlType, 
		url: "ws/meetingroomReservation/reservation", 
		data: JSON.stringify(resData), 
		contentType: "application/json; charset=utf-8", 
		dataType: "json", 
		success: function (data) {handleResult(data); }, 
		error: function (msg) { 
		alert(msg.responseText); 
		} 
		});
	

	function handleResult(data)
	{
		if (!data.id)
		{
		  	showDialog(errMsgs.addMRRWarnMsgTitle, errMsgs.addMRRWarnMsg, true);
		}
		else
		{
			$("#cancelMRR").click();
			loadAvaliableMeetingRoomStatus();
		}
	
	}
}

/**
 * Get the recurrent type and change the message of interval label.
 * @param recValue
 */
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
	if (dateStr != null)
	{
		if (typeof dateStr=="string")
		{
			date = new Date(Date.parse(dateStr));
		}
		else if (typeof dateStr == "number")
		{
			date = new Date(dateStr);
		}
		date.setMinutes(date.getMinutes()+date.getTimezoneOffset());
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
	var date = null;
	
	if (dateStr)
	{
		date = new Date(Date.parse(dateStr));
		date.setMinutes(date.getMinutes()+date.getTimezoneOffset());
	}
	else
	{
		date = new Date();
	}
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
		showDialog(errMsgs.commonWarnTitle, errMsgs.mrUnvaliableWarnMsg, true);
		$("#addMRR").attr("data-toggle","hide");
		$("#addMRR").prop("disabled",true);
		return;
	}
	
	$("#mrrEditDialogHeader").html("Add Meeting Room Reservation");
}

function deleteMRR(mrrId)
{
	$("#delMRBtn").click(function()
	{
		$.ajax({ 
			type: "DELETE", 
			url: "ws/meetingroomReservation/meetingRoom/" + mrrId, 
			contentType: "application/json; charset=utf-8", 
			async:false,
			dataType: "json", 
			success: function (data) {
				$("#myReservation").find("#"+mrrId).remove();
			}, 
			error: function (msg) { 
			alert(msg.responseText);
			} 
			});
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
		msg = errMsgs.intervalInvalid;
		isIntervalValid = false;
	}
	else if (!numPattern.test(intValue))
	{
		msg = errMsgs.integerInvalid;
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
 * @param startEl the start time/date element of reservation for process.
 * @param endEl the end time/date element of reservation for process.
 * @param isSingle the flag for if it is single reservation.
 */

function startTimeValidate(startEl, endEl, isSingle)
{
	var isStartTimeValid = true;
	var startDateValue = $(startEl +"Container input[type='text']").val();
	var startDateTimeStr = startDateValue + " " +$("#startTime").text();
	var starTi = null;
	var msg = "";
	
	if (!startDateValue || startDateValue == "")
	{
		if (isSingle)
		{
			msg = errMsgs.singleStartTime1;	
		}
		else
		{
			msg = errMsgs.recurrentStartDate1;	
		}
		isStartTimeValid = false;
	}
	else if (isNaN(Date.parse(startDateValue))||!datePattern.test(startDateValue))
	{
		if (isSingle)
		{
			msg = errMsgs.singleStartTime2;
		}
		else
		{
			msg = errMsgs.recurrentStartDate2;
		}
		isStartTimeValid = false;
	}
	else
	{	
		var tempTi = new Date();
		starTi = new Date(Date.parse(startDateTimeStr));
		if (!(tempTi.getFullYear() <= starTi.getFullYear()&&tempTi.getMonth() <= starTi.getMonth()&&tempTi.getDate() <= starTi.getDate()))
		{
			if (isSingle)
			{
				msg = errMsgs.singleStartTime3;
			}
			else
			{
				msg = errMsgs.recurrentStartDate3;
			}
			isStartTimeValid = false;
		}
		else if (tempTi.getFullYear() == starTi.getFullYear()&&tempTi.getMonth() == starTi.getMonth()&&tempTi.getDate() == starTi.getDate() 
					&& parseTimeStr($("#startTime").text()) <= getTimeMinutesWithoutDate())
		{
			addOrRemoveErrorMsg(false, "#startTime", errMsgs.startTimeError);
			enableOrDisableSubmit(false);
		}
	}
	

	addOrRemoveErrorMsg(isStartTimeValid, startEl, msg);
	enableOrDisableSubmit(isStartTimeValid);
	
	if (!isSingle && isStartTimeValid && $(endEl+'Container').hasClass('has-error'))
	{
		endTimeValidate(endEl, startEl);
	}
}


/**
 * The function for check if the end time/date is valid or not.
 * @param endEl the end time/date element of reservation for process.
 * @param startEl the start time/date element of reservation for process.
 */
function endTimeValidate(endEl, startEl)
{
	var isEndTimeValid = true;
	var endDateValue = $(endEl +"Container input[type='text']").val();
	var msg = "";

	if (!endDateValue || endDateValue == "")
	{
		msg = errMsgs.recurrentEndDate1;
		isEndTimeValid = false;
	}
	else if (isNaN(Date.parse(endDateValue))|| !datePattern.test(endDateValue))
	{
		msg = errMsgs.recurrentEndDate2;
		isEndTimeValid = false;
	}
	else
	{
		var startDateValue = $(startEl +"Container input[type='text']").val();
		if (!$(startEl+'Container').hasClass('has-error') && startDateValue == "")
		{
			startTimeValidate(startEl, endEl, false);
		}
		
		if (!$(startEl+'Container').hasClass('has-error'))
		{
			var starTi = new Date(Date.parse(startDateValue));
			var endTi = new Date(Date.parse(endDateValue));
			if (endTi.getTime() <= starTi.getTime())
			{
				msg = errMsgs.recurrentEndDate3;
				isEndTimeValid = false;
			}
			else
			{
				starTi.setMonth(starTi.getMonth() + 3);
				if (endTi.getTime() > starTi.getTime())
				{
					msg = errMsgs.recurrentEndDate4;
					isEndTimeValid = false;
				}
			}
						
		}
		else
		{
			msg = errMsgs.recurrentEndDate5;
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
	$("#startDateContainer input[type='text']").change(function(){startTimeValidate("#startDate", null, true)});
	$("#recEndDateContainer input[type='text']").change(function(){endTimeValidate("#recEndDate", "#startDate")});
	$("#saveEditMRRBtn").click(submitMRR);
	$("#addMRR").click(addMRR);
	$("#cancelMRR").click(resetReservation);
	$("#mrrFloor").change(getMrFloorChange);
	$("#reservationType").click(getReservationType);
	selectedDate = getDateWithoutTime(null);
	$("#mrrDatePicker").text("Current Date: " + getDateStrOrTimeStr(selectedDate, null));
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
	$('.mrrDatePicker').datetimepicker({
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0,
		pickerPosition:"bottom-left"
    });
	$('.mrrDatePicker').click(function(){$(this).datetimepicker("show");});
	$('.mrrDatePicker').datetimepicker().on("changeDate", function(ev){
		selectedDate = getDateWithoutTime(ev.date.valueOf());
		var labelId = $(this).prev().prop("id");
		if(labelId == "mrrDatePicker")
		{
			$("#mrrDatePicker").text("Current Date: " + getDateStrOrTimeStr(selectedDate, null));
			loadAvaliableMeetingRoomStatus();
		}
		else
		{
			$("#allMrrDatePicker").text("Current Date: " + getDateStrOrTimeStr(selectedDate, null));
			loadAllMeetingRoomStatus();
		}
	  });
}

/**
 * Format the time string.
 * @param value the value to process.
 * @returns {String} the formated time string.
 */
function formatTimeStr(value)
{
	if (value < 10)
	{
		value ='0' + value;
	}
	
	return value;
}

/**
 * Get the formated date time string.
 * @param date the date to process.
 * @param minutes the minutes to process.
 * @returns the formated date time string.
 */
function getDateStrWithGivenTime(date, minutes)
{
	
	if (typeof date=="string")
	{
		date = new Date(Date.parse(date));
		date.setMinutes(date.getMinutes()+date.getTimezoneOffset());
	}
	else if (typeof date == "number")
	{
		date = new Date(date);
	}
	var dateStr = date.getFullYear();
	dateStr += "/" + formatTimeStr(date.getMonth() + 1);
	dateStr += "/" + formatTimeStr(date.getDate());
	if (minutes != null)
	{
		date.setHours(parseInt(minutes / 60));
		date.setMinutes(minutes % 60);
	}
	var tm = date.getHours() < 12 ? "AM" : "PM";
	dateStr += "  " + formatTimeStr(date.getHours()%12);
	dateStr += ":" + formatTimeStr(date.getMinutes());
	dateStr += " " + tm;
	return dateStr;
}

/**
 * Get the recurrent type message to display.
 * @param recValue the value of recurrent type.
 * @param intervalValue the value of interval.
 * @returns {String} the recurrent type message to display.
 */
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

/**
 * Book the meeting room.
 * @param floor the floor of meeting room selected to set.
 * @param mrId the meeting room id to set.
 */
function bookRoom(floor, mrId)
{
	$("#mrrFloor").val(floor);
	$("#mrrFloorMeetingRoom").html(mrObj[floor].data);
	$("#mrrFloorMeetingRoom").val(mrId);
	addMRR();
}

/**
 * Get the meeting room status operation.
 * @param floor the floor of meeting room selected to set. 
 * @param mrId the meeting room id to set.
 * @returns {String} the meeting room status operation.
 */
function getMrOperation(floor, mrId)
{
	return '<button  class="btn btn-primary" data-toggle="modal" data-backdrop="static" '
		+ 'data-keyboard="false" data-target="#meetingRoomReservationEdit" id="bookRoom('+ floor +','+ mrId +')">Book It</button>';
}

/**
 * Get the meeting room reservation operation.
 * @param mrrId the meeting room reservation id to set.
 * @returns {String} the meeting room reservation operation.
 */
function getReservationOperation(mrrId)
{
	return '<input type="button" class="btn btn-primary" data-toggle="modal" data-target="#meetingRoomReservationEdit" '
		+ 'value="edit" onclick="editMRR('+mrrId+')"/> <input type="button" class="btn btn-danger" data-toggle="modal" '
		+ 'data-target="#MyModal1" value="delete" onclick="deleteMRR('+mrrId+')"/>';
}

/**
 * Get the current day status of meeting room.
 * @param items the time interval to be processed.
 * @returns the current day status of meeting room.
 */
function getTodayStatus(items, mrId)
{
	var el = null;
	el= $("<canvas  id='"+mrId+"' data-toggle='modal' data-target='#meetingRoomReservationEdit' width='301' height='35' ></canvas>");
	var ctx = el.get(0).getContext("2d");
	var y1 = 2;
	var y2 = 20;
	var x1 = 0;
	var x2 = 0;
	
	function drawTimeStamp(x1, x2, isUsed, isCurrentUserItem)
	{
		ctx.fillStyle = colorArr.white;
		ctx.fillRect(x1-1, y1, 1, 17);
		ctx.fillRect(x2+1, y1, 1, 17);
		if (isUsed && isCurrentUserItem)
		{
			ctx.fillStyle = colorArr.green;
		}
		else if (isUsed)
		{
			ctx.fillStyle = colorArr.red;
		}
		else
		{
			ctx.fillStyle = colorArr.blue;
		}
		ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
	}
	
	
	
	function formatReservationInfo(item)
	{
		var msg = "Start date:" + getDateStrWithGivenTime(item.startTime);
		msg += "<br> End date: " + getDateStrWithGivenTime(item.endTime);
		msg += "<br> Ordered by: " + item.user.name;
		return msg;
	}
	
	drawTimeStamp(x1, 301, false, false);
	if (items && items.length > 0)
	{
		for (var i= 0; i < items.length; i++)
		{
			x1 = getXaxisValue(items[i].startTime);
			x2 = getXaxisValue(items[i].endTime);
			
			if (!timeRangeData[items[i].mrId])
			{
				timeRangeData[items[i].mrId]={};
				timeRangeData[items[i].mrId].data=[];
				timeRangeData[items[i].mrId].date= getDateWithoutTime(items[i].startTime);
			}
			var itemInfo = {};
			itemInfo.startPos = x1;
			itemInfo.endPos = x2;
			itemInfo.reservationInfo = formatReservationInfo(items[i]);
			itemInfo.mrrId= items[i].mrrId;
			itemInfo.isCurrentUserItem= currentUser.id == items[i].user.id;
			timeRangeData[items[i].mrId].data.push(itemInfo);
			drawTimeStamp(x1, x2, true, currentUser.id == items[i].user.id);
		}
		
	}
	
	function drawTimeTicks()
	{
		var start = 0;
		y1 = 18;
		ctx.fillStyle = colorArr.black;
		start = 0;
		for (var i = 0; i < 11; i++)
		{
			ctx.fillRect(start, y1, 1, y2 - y1);
			start += 30;
		}
		ctx.fillRect(0, 20, 301, 1);
		ctx.font = "15px bold";
		ctx.fillText("8", 0, 33);
		ctx.fillText("12", 140, 33);
		ctx.fillText("18", 285, 33);
	}
	drawTimeTicks();
	
	return el.get(0);
}

function getXaxisValue(date)
{
	var minutes = 0;
	if (typeof date=="string")
	{
		date = new Date(Date.parse(date));
		date.setMinutes(date.getMinutes()+date.getTimezoneOffset());
	}
	minutes += date.getHours()*60 + date.getMinutes();
	
	return parseInt((minutes-480)/2);
}

function getReservationInfo()
{
	if (!timeRangeData[this.id])
	{
		return;
	}
	var e = arguments[0];
	var x = e.offsetX;
	var data = timeRangeData[this.id].data;
	var p = $(this).position();
	for (var i = 0; i < data.length; i++)
	{
		if (data[i].startPos <= x && x <= data[i].endPos)
		{
			$("#expandcomment span").html(data[i].reservationInfo);
			$("#expandcomment").css({
				"position" : "absolute",
				"top" : p.top- 30,
				"left" : p.left+x,
				"background-color":"#fcfcfc",
				"border":"1px solid red",
				"font-size" : "10px",
				"width" : "160px",
				"height" : "45px",
				"z-index" : "9999"
			});
			$("#expandcomment").show();
			break;
		}
	}
	
}

function hideReservationInfo()
{
	$("#expandcomment span").html("");
    $("#expandcomment").hide();
}

function editReservation()
{
	var e = arguments[0];
	e.preventDefault();
	hideReservationInfo();
	if (selectedDate.getTime() < getDateWithoutTime().getTime())
	{
		$(this).attr("data-toggle","hide");
		showDialog(errMsgs.commonWarnTitle, errMsgs.mrEditOldDayWarnMsg, true);
		return;
	}
	else if (!timeRangeData[this.id] || timeRangeData[this.id].date.getTime() < getDateWithoutTime().getTime())
	{
		$(this).attr("data-toggle","modal");
		bookRoom(mrData[this.id].floor, mrData[this.id].id);
		return;
	}
	
	var x = e.offsetX;
	var data = timeRangeData[this.id].data;
	var currentDateX = getXaxisValue(new Date());
	var isToday = timeRangeData[this.id].date.getTime() == getDateWithoutTime().getTime();
	var leftPos = 0,rightPos = 300,leftdist=0,rightdist=0;
	
	for (var i = 0; i < data.length; i++)
	{
		if (data[i].startPos <= x && x <= data[i].endPos)
		{
			var msg = errMsgs.mrNoPrivilegeWarnMsg;
			if (data[i].isCurrentUserItem)
			{
				if (isToday && currentDateX < data[i].startPos || !isToday)
				{
					editMRR(data[i].mrrId);
					$(this).attr("data-toggle","modal");
					return;
				}
				else
				{
					msg = errMsgs.mrEditWarnMsg;
				}
			}
			
			$(this).attr("data-toggle","hide");
			showDialog(errMsgs.commonWarnTitle, msg, true);
			return;
		}
		
		if ((data[i].endPos < leftPos && leftdist > leftPos - data[i].endPos || leftdist == 0) && rightPos > data[i].endPos)
		{
			leftdist = leftPos - data[i].endPos;
			leftPos = data[i].endPos;
		}
		
		if ((rightPos > data[i].startPos && rightdist > rightPos - data[i].startPos || rightdist == 0 )&& leftPos < data[i].startPos)
		{
			rightdist = rightPos - data[i].startPos;
			rightPos = data[i].startPos;
		}
	}
	if (isToday)
	{
		if (currentDateX + 3 > rightPos)
		{
			$(this).attr("data-toggle","hide");
			showDialog(errMsgs.commonWarnTitle, errMsgs.mrEditUnvaliableTodayWarnMsg, true);
			return;
		}
		else if (currentDateX > leftPos && currentDateX < rightPos)
		{
			leftPos = currentDateX;
		}
	}
		
	setStartOrEndTime((leftPos+2)*2 + 480, true);
	setStartOrEndTime((rightPos -2)*2 + 480, false);
	$("#startDateContainer input").val(getDateStrOrTimeStr(timeRangeData[this.id].date, null));
	$(this).attr("data-toggle","modal");
	bookRoom(mrData[this.id].floor, mrData[this.id].id);

}

function cacheReservationItems(items)
{
	if (items && items.length > 0)
	{
		for (var i = 0; i < items.length; i++)
		{
			myReservations[items[i].id] = items[i];
		}
	}
}

function getReservationByDateRangeAndMrId(start, end, mrId, callback)
{
	var startDate = new Date(start.valueOf());
	var endDate = new Date(end.valueOf());
	var queryData = {startTime:startDate,endTime:endDate,id:mrId};
	$.ajax({ 
		type: "POST", 
		url: "ws/meetingroomReservation/meetingroomStatus", 
		data: JSON.stringify(queryData), 
		contentType: "application/json; charset=utf-8", 
		dataType: "json", 
		success: function (data) {
			callback(processDataForCalender(data.timeIntervalItems)); }, 
		error: function (msg) { 
		alert(msg.responseText); 
		} 
		});
}

function processDataForCalender(items)
{
	var result = [];
	var data = null;
	if (items && items.length > 0)
	{
		var currentDate = new Date();
		var startDate = null;
		var endDate = null;
		for (var i = 0; i < items.length; i++)
		{
			data = {id:items[i].mrrId,title:items[i].resSubject,start:items[i].startTime,end:items[i].endTime};
			startDate = new Date(Date.parse(items[i].startTime));
			startDate.setMinutes(startDate.getMinutes()+startDate.getTimezoneOffset());
			endDate = new Date(Date.parse(items[i].endTime));
			endDate.setMinutes(endDate.getMinutes()+endDate.getTimezoneOffset());
			if (startDate.getTime() > currentDate.getTime())
			{
				data.color= colorArr.lightGreen;
				data.editable = true;
			}
			else if (endDate.getTime() < currentDate.getTime())
			{
				data.color= colorArr.grey;
			}
			else
			{
				data.color= colorArr.yellow;
			}
			
			result.push(data);
		}
	}
	
	return result;
}

function getMRCalender()
{
	calMrId = this.id;
	$('#calendar').show();
	$('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			defaultView: 'agendaWeek',
			editable: false,
			allDaySlot:false,
			eventTextColor: 'black',
			minTime:"08:00:00",
			maxTime:"18:00:00",
			hiddenDays: [ 0, 6 ],
			eventLimit: true, // allow "more" link when too many events
			loading: function(bool) {

			},
			events: function(start, end, timezone, callback) {
				getReservationByDateRangeAndMrId(start, end, calMrId,callback);
			}
		});
	$( "#calendar" ).dialog({ width: 600,height:500,show: {
        effect: "blind",
        duration: 1000
      },
      hide: {
        effect: "explode",
        duration: 1000
      },
      beforeClose: function( event, ui ) {
    	// $('#calendar').fullCalendar('removeEvents');
    	 },
	  open: function( event, ui ) {
	   $('#calendar').fullCalendar('refetchEvents');}  
	});	
}

function processMeetingRooomStatusData(mrTab,result)
{
	mrTab.innerHTML="";
	var index = null;
	var row = null;
	var imgSource = null;
	myReservations = {};
	timeRangeData={};
	for(var i=0;i<result.length;i++)
	{
		row=mrTab.insertRow(i);
		index = 0;
		var cel = row.insertCell(index++);
		if(result[i].meetingRoom.image && result[i].meetingRoom.image.length > 0)
		{
			imgSource = "mrimages?image="+result[i].meetingRoom.image;
		}
		else
		{
			imgSource = "img/noImage.png";
		}
		cel.appendChild($("<img id='"+result[i].meetingRoom.id+"' class = 'pull-left mrr-image' src='"+imgSource+"' width='45' height='45' />").get(0));
		cel.appendChild($("<div>  "+result[i].meetingRoom.name+"</div>").get(0));
		cel.appendChild($('<div> <a data-toggle="modal" data-target="#editLocation" onclick="initLocationEdit('+result[i].meetingRoom.id+')">'+result[i].meetingRoom.floor+'F '+result[i].meetingRoom.location+'</a></div>').get(0));
		cel = row.insertCell(index++);
		//cel.appendChild($("<img class = 'pull-left' src='img/phone.png' width='39' height='32' />").get(0));
		//cel.appendChild($("<img class = 'pull-left' src='img/recorder.png' width='39' height='32' />").get(0));
		if (result[i].meetingRoom.phoneExist)
		{
			cel.appendChild($("<img class = 'pull-left' src='img/phone.png' width='39' height='32' />").get(0));
		}
		if (result[i].meetingRoom.projectorExist)
		{
			cel.appendChild($("<img class = 'pull-left' src='img/recorder.png' width='39' height='32' />").get(0));
		}
		cel = row.insertCell(index++);
	    $(cel).addClass("align-bottom");
	    cel.appendChild($("<div> Seats#: "+result[i].meetingRoom.seats+"</div>").get(0));
		row.insertCell(index++).appendChild(getTodayStatus(result[i].timeIntervalItems, result[i].meetingRoom.id));
		row.insertCell(index++).innerHTML= getMrOperation(result[i].meetingRoom.floor, result[i].meetingRoom.id);
		cacheReservationItems(result[i].reservationItems);
	}
}

/**
 * Load avaliable meeting room status.
 */
function loadAvaliableMeetingRoomStatus()
{
	if (!isAvaliableView)
	{
		isAvaliableView = true;
		selectedDate = getDateWithoutTime(null);
		$("#mrrDatePicker").text("Current Date: " + getDateStrOrTimeStr(selectedDate, null));
	}
	
	$.get("ws/meetingroomReservation/reservation/"+selectedDate.getTime(), function (result) {
		var mrTab=document.getElementById("avaliableMeetingRoomStatus");
		processMeetingRooomStatusData(mrTab,result);
		$("#avaliableMeetingRoomStatus tr td img.mrr-image").click(getMRCalender);
		$("#avaliableMeetingRoomStatus canvas").mouseover(getReservationInfo);
		$("#avaliableMeetingRoomStatus canvas").mouseout(hideReservationInfo);
		$("#avaliableMeetingRoomStatus canvas").click(editReservation);
	});

}


/**
 * Load all meeting room status.
 */
function loadAllMeetingRoomStatus()
{
	if (isAvaliableView)
	{
		isAvaliableView = false;
		selectedDate = getDateWithoutTime(null);
		$("#allMrrDatePicker").text("Current Date: " + getDateStrOrTimeStr(selectedDate, null));
	}
	$.get("ws/meetingroomReservation/"+selectedDate.getTime(), function (result) {
		var mrTab=document.getElementById("allMeetingRoomStatus");
		processMeetingRooomStatusData(mrTab,result);
		$("#allMeetingRoomStatus canvas").mouseover(getReservationInfo);
		$("#allMeetingRoomStatus canvas").mouseout(hideReservationInfo);
		$("#allMeetingRoomStatus canvas").click(editReservation);
	});

}

/**
 * Load my reservation status.
 */
function loadMyReservaion()
{
	$.get("ws/meetingroomReservation/user/"+currentUser.id, function (mrrData) {
		var mrTab=$("#myReservation").get(0);
		mrTab.innerHTML="";
		processMeetingRooomStatusData(mrTab,mrrData);
		$("#myReservation canvas").mouseover(getReservationInfo);
		$("#myReservation canvas").mouseout(hideReservationInfo);
		$("#myReservation canvas").click(editReservation);
	  });
}

/**
 * Fill the table cell with  the given data.
 * @param row the row to be filled.
 * @param mrr the meeting room reservation to filled.
 * @param isNewData if it is new data or updated data.
 */
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

function parseTimeStr(timeStr)
{
	var ti = 0;
	if (timeStr && timeStr.length > 0)
	{
		var t = timeStr.split(":");
		ti += parseInt(t[0])*60;
		ti += parseInt(t[1]);
	}
	
	return ti;
}
function setStartOrEndTime(minutes, isStartTime)
{
	var leftVal = ((minutes-minTime) / total) * 100;
	if (isStartTime)
	{
		arrbtn.get(0).style.left = leftVal + "%";
		smallbar.css({"left": leftVal + "%"});
		smallwidth();
		updateTime(minP, leftVal);
	}
	else
	{
		arrbtn.get(1).style.left = leftVal + "%";
		smallwidth();
		updateTime(maxP, leftVal);
	}
}
function dragTime()
{
	var Isclick = false, zindex = 2;
	smallbar.css({"width":"100%","left":0});
	arrbtn.get(0).style.left = 0;
	arrbtn.get(1).style.left = 100 + "%";
	var isMinTimeBtn,maxlenght,lenght, startX,btnlenght;
	arrbtn.mousedown(timeMouseDown);
	
	function timeMouseDown()
	{
		isMinTimeBtn = this.id == "minTimeBtn";
		if (!maxwidth)
		{
			maxwidth = $("#dragbar").prop("offsetWidth");
		}
		var e = arguments[0];
		Isclick = true;
		this.style.zIndex = ++zindex;
		startX = e.clientX;
		lenght = this.offsetLeft + (this.offsetWidth / 2 - 1);
		if (isMinTimeBtn)
		{
			btnlenght = arrbtn.get(1).offsetLeft + (arrbtn.get(1).offsetWidth / 2 - 1);
			maxlenght = Math.min(maxwidth, btnlenght);
		}
		else
		{
			btnlenght = arrbtn.get(0).offsetLeft + (arrbtn.get(0).offsetWidth / 2 - 1);
			maxlenght = Math.max(maxwidth, btnlenght);
		}
		
		document.onmousemove=timeMouseMove;
		this.setCapture && this.setCapture();
	}
	
	function timeMouseMove()
	{
		var e = arguments[0];
		if (Isclick)
		{
			var thisX = e.clientX;
			var golenght = 0;
			if (isMinTimeBtn)
			{
				golenght = Math.min(maxlenght, Math.max(0, lenght
						+ (thisX - startX)));
			}
			else
			{
				golenght = Math.max(btnlenght, Math.min(maxwidth, lenght
						+ (thisX - startX)));
			}
			var leftVal = (golenght / maxwidth) * 100;
			if (isMinTimeBtn)
			{
				arrbtn.get(0).style.left = leftVal + "%";
				smallbar.css({"left": leftVal + "%"});
				smallwidth();
				updateTime(minP, leftVal);
			}
			else
			{
				arrbtn.get(1).style.left = leftVal + "%";
				smallwidth();
				updateTime(maxP, leftVal);
			}
			
			document.onmouseup = timeMouseUp;
		}
		else
		{
			return false;
		}

	}
	
	function timeMouseUp()
    {
		Isclick = false;
		if (isMinTimeBtn)
		{
			arrbtn.get(0).releaseCapture && arrbtn.get(0).releaseCapture();
		}
		else
		{
			arrbtn.get(1).releaseCapture && arrbtn.get(1).releaseCapture();
		}
    }
}

function smallwidth()
{
	var left = parseFloat(arrbtn.get(0).style.left);
	var right = parseFloat(arrbtn.get(1).style.left);
	smallbar.get(0).style.width = (right - left > 0 ? Math.floor(right - left) : 0)
	+ "%";
}
function updateTime(obj, leftVal)
{
	var p = parseInt((total / 100) * leftVal) + minTime;
	if (p > minTime && p < maxTime)
	{
		p = p % 5 > 3 ? p + (5 - (p % 5)) : p - (p % 5);
	}
	obj.text(formatTimeStr(parseInt(p/60)) + ":" +formatTimeStr(p%60));
	if ($("#startTime").text() == $("#endTime").text())
	{
		addOrRemoveErrorMsg(false, "#startTime", errMsgs.timeRangeError);
		enableOrDisableSubmit(false);
	}
	else
	{
		addOrRemoveErrorMsg(true, "#startTime", "");
		enableOrDisableSubmit(true);
	}
}

initMRResElement();
loadMeetingRooms();
loadAvaliableMeetingRoomStatus();
dragTime();