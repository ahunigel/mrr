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
		mrUnvaliableWarnMsg:"The reservation cannot be shown due to there is no meeting room to select, please contact administrator !",
		mrNoPrivilegeWarnMsg:"You don't have the privilege to do this operation!",
		mrEditWarnMsg:"The reservation is going/expired, you cannot edit it!",
		mrEditOldDayWarnMsg:"Yon cannot add or edit reservation the day before today!",
		mrEditUnvaliableTodayWarnMsg:"There is no avaliable time range for add reservation!",
		mrrDeleteWarnMsg:"Please select the reservation to delete!",
		mrrRecChoiceWarnMsg:"Please select the type of recurrent reservation to delete!"
}
var datePattern = /^2\d{3}\/[0-1]\d\/[0-3]\d$/;
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
var isMyResView = false;

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

/**
 * Process the data of meeting room.
 */
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
	
	if (floorOptions.length == 0)
	{
		return false;
	}
	
	return true;
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
		$("#startDateContainer input[type='text']").change(function(){startTimeValidate("#startDate", null, true);});
	}
	else
	{
		$("#dateLabel").text("Start Date");
		$(".recurrent-group").removeClass("hide");
		$("#resInterval").change(checkRecInterval);
		$("#ReservationPt").change(function(){
			 var recValue = $("#ReservationPt input:checked").val();
			getRecurrentType(recValue)});
		$("#startDateContainer input[type='text']").change(function(){startTimeValidate("#startDate", "#recEndDate", false);});

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
			input.value = input.value;
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
	$("#mrrEditDialogHeader").html("Add Meeting Room Reservation");
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
	
	$("#mrrEditDialogHeader").html("Edit Meeting Room Reservation");
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
			date = date.replace(/-/g,"/").replace(/T/g," ");
			tempDate = new Date(Date.parse(date));
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
	  		 $(this).unbind("click");
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
	 $("#errorDialog #confirmBtn").bind("click");
	if (isHiddenCancelBtn)
	{
		$("#errorDialog .btn-default").hide();
	}
	else
	{
		$("#errorDialog .btn-default").show();
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
		  	setTimeout(function(){showDialog(errMsgs.addMRRWarnMsgTitle, errMsgs.addMRRWarnMsg, true)},500);
		}
		else
		{
			$("#cancelMRR").click();
			if (isMyResView)
			{
				loadMyReservaion();
			}
			else if (isAvaliableView)
			{
				loadAvaliableMeetingRoomStatus();
			}
			else
			{
				loadAllMeetingRoomStatus();
			}
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
			dateStr = dateStr.replace(/-/g,"/").replace(/T/g," ");
			date = new Date(Date.parse(dateStr));
		}
		else if (typeof dateStr == "number")
		{
			date = new Date(dateStr);
			date.setMinutes(date.getMinutes()+date.getTimezoneOffset());
		}
		else
		{
			date = dateStr;
		}
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
		dateStr = dateStr.replace(/-/g,"/").replace(/T/g," ");
		date = new Date(Date.parse(dateStr));
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
function checkMeetingRoomAvaliable()
{
	if (!processMeetingRoomData())
	{
		showDialog(errMsgs.commonWarnTitle, errMsgs.mrUnvaliableWarnMsg, true);
		$(".addMRR").attr("data-toggle","hide");
		return false;
	}
	
	$(".addMRR").attr("data-toggle","modal");
	return true;
}

function deleteMRR(mrrId, isitemId)
{
	var url = "ws/meetingroomReservation/meetingRoom/" + mrrId;
	if (isitemId)
	{
		url = "ws/meetingroomReservation/timeIntervalItem/" + mrrId;
	}
	$.ajax({ 
		type: "DELETE", 
		url: url, 
		contentType: "application/json; charset=utf-8", 
		async:false,
		dataType: "json", 
		success: function (data) {
			$("#calcelDelMRRBtn").click();
			loadMyReservaion();
		}, 
		error: function (msg) { 
		alert(msg.responseText);
		} 
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
	var tempTi = getDateWithoutTime();
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
		starTi = getDateWithoutTime(Date.parse(startDateTimeStr));
		if (tempTi.getTime() > starTi.getTime())
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
		else if (tempTi.getTime() == starTi.getTime() )
		{
			if (parseTimeStr($("#startTime").text()) <= getTimeMinutesWithoutDate())
			{
				addOrRemoveErrorMsg(false, "#startTime", errMsgs.startTimeError);
				enableOrDisableSubmit(false);
			}
		}
		else
		{
			if ($('#startTimeContainer').hasClass('has-error'))
			{
				addOrRemoveErrorMsg(true, "#startTime", "");
				enableOrDisableSubmit(true);
			}
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
	$(".addMRR").click(checkMeetingRoomAvaliable);
	$(".refresh").click(loadAvaliableMeetingRoomStatus);
	$("#cancelMRR").click(resetReservation);
	$("#mrrFloor").change(getMrFloorChange);
	$("#reservationType").click(getReservationType);
	selectedDate = getDateWithoutTime(null);
	$("#delMRRBtn").click(deleteMyReservation);
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
function getDateStrWithGivenTime(datee, minutes)
{
	var date = null;
	if (typeof datee=="string")
	{
		datee = datee.replace(/-/g,"/").replace(/T/g," ");
		date = new Date(Date.parse(datee));
	}
	else if (typeof datee == "number")
	{
		date = new Date(datee);
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
 * Get the valid date.
 * @param datee the date to process.
 * @returns the valid date time.
 */
function getValidDate(datee, minutes)
{
	var date = null;
	if (typeof datee=="string")
	{
		datee = datee.replace(/-/g,"/").replace(/T/g," ");
		date = new Date(Date.parse(datee));
	}
	else if (typeof datee == "number")
	{
		date = new Date(datee);
	}
	if (minutes != null)
	{
		date.setHours(parseInt(minutes / 60));
		date.setMinutes(minutes % 60);
	}
	return date;
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
	if (floorOptions.length < 1)
	{
		processMeetingRoomData();
	}
	$("#mrrFloor").val(floor);
	$("#mrrFloorMeetingRoom").html(mrObj[floor].data);
	$("#mrrFloorMeetingRoom").val(mrId);
}

/**
 * Get the meeting room status operation.
 * @param floor the floor of meeting room selected to set. 
 * @param mrId the meeting room id to set.
 * @returns {String} the meeting room status operation.
 */
function getMrOperation(floor, mrId, status)
{
	if(status == 'AVAILABLE')
	{
		return '<button  class="btn btn-primary" data-toggle="modal" data-backdrop="static" '
		+ 'data-keyboard="false" data-target="#meetingRoomReservationEdit" onclick="bookRoom('+ floor +','+ mrId +')">Book It</button>';
	}
	else
	{
		return '<button  class="btn btn-info" data-backdrop="static" '
		+ 'data-keyboard="false" disabled = "disabled">Occupied!!</button>';
	}
}

/**
 * Get the operation of my reservation.
 * @returns {String}
 */
function getMyMrOperation(items)
{
	var now = new Date();
	var nowIsInUse = false;
	var returnVal = "";
	for(var i = 0; i < items.length; i++)
	{
		if(getValidDate(items[i].startTime).getTime() <= now.getTime() && getValidDate(items[i].endTime).getTime() >= now.getTime())
		{
			nowIsInUse = true;
			break;
		}
	}
	if(nowIsInUse)
	{
		returnVal = "<button  class='btn btn-info resDeleteBtn'  data-toggle='modal' data-backdrop='static' data-keyboard='false' " 
			+"data-target='#myReservationDelete' disabled='disabled'>In Use</button>";
	}
	else 
	{
		returnVal = "<button  class='btn btn-primary resDeleteBtn'  data-toggle='modal' data-backdrop='static' data-keyboard='false' " 
			+"data-target='#myReservationDelete'>Release It!</button>";
	}
	return returnVal
}

/**
 * Get the dialog of my reservation.
 */
function getMyReservationDialog()
{
	var cv = $(this).parent().prev().children();
	$("#deleteResDiv").html("");
	var items = timeRangeData[cv.prop("id")][cv.attr("day")];
	var resDiv = '<div class="col-sm-offset-1 col-sm-11 btn-group delMyRes">'
					+'<input name="deleteMrrItem" type="radio"/></div>';
	var recurrentChoiceDiv = '<div class="col-sm-offset-3 col-sm-9 btn-group delRecurrentChoice hide"><input name="delRecurrentChoice" value="single" type="radio"/>Only This One'
		+'<input name="delRecurrentChoice" value="all" type="radio"/>Delete All</div>';
	var msg = "";
	for (var i = 0; i < items.length; i++)
	{
		var res = myReservations[items[i].mrrId];
		if (res.reservationType == "SINGLE")
		{
			msg = "Start date:" + getDateStrWithGivenTime(res.startTime) + "  End date: " + getDateStrWithGivenTime(res.endTime);
			$(resDiv).find("input").prop("value", items[i].mrrId).attr("resType",res.reservationType).parent().append(msg).appendTo("#deleteResDiv");
		}
		else
		{
			msg = "Start date:" + getDateStrWithGivenTime(res.startTime, res.recurrentStartTime) + "  End date: " + getDateStrWithGivenTime(res.endTime, res.recurrentEndTime);
			$(resDiv).find("input").prop("value", items[i].mrrId).attr("resType",res.reservationType).parent().append(msg).appendTo("#deleteResDiv");
			$(recurrentChoiceDiv).attr("itemId", items[i].id).appendTo("#deleteResDiv");	
		}
	}
	
	$("#deleteResDiv .delMyRes").click(function(){
		var resType = $("input[name='deleteMrrItem']:checked").attr("resType");
		$(".delRecurrentChoice").addClass("hide");
		if (resType != "SINGLE")
		{
			$(this).next().removeClass("hide");
		}
	});
}

/**
 * Delete my reservation.
 */
function deleteMyReservation()
{
    var e = (arguments[0] == undefined)?window.event : arguments[0];
	e.preventDefault();
	var mrr = $("input[name='deleteMrrItem']:checked");
	var rec = $("input[name='delRecurrentChoice']:checked");
	var isSingleRes = mrr.attr("resType") == "SINGLE";
	var msg = ""
	if (mrr.length == 0)
	{
		msg = errMsgs.mrrDeleteWarnMsg;
	}
	else if (!isSingleRes && rec.length == 0)
	{
		msg = errMsgs.mrrRecChoiceWarnMsg;
	}
	
	if (msg != "")
	{
		showDialog(errMsgs.commonWarnTitle, msg, true);
		return;
	}
	
	if (isSingleRes || !isSingleRes && rec.prop("value")=="all")
	{
		deleteMRR(mrr.prop("value"),false);
	}
	else
	{
		deleteMRR(rec.parent().attr("itemId"),true);
	}

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
		var cavDate = getDateStrOrTimeStr(items[0].startTime);
		el.attr("day", cavDate);
		if (!timeRangeData[items[0].mrId])
		{
			timeRangeData[items[0].mrId]={};
			if (isMyResView)
			{
				timeRangeData[items[0].mrId][cavDate]=[];
			}
			else
			{
				timeRangeData[items[0].mrId].data=[];
			}
		}
		
		if (isMyResView && !timeRangeData[items[0].mrId][cavDate])
		{
			timeRangeData[items[0].mrId][cavDate] = [];
		}
		
		
		for (var i= 0; i < items.length; i++)
		{
			x1 = getXaxisValue(items[i].startTime);
			x2 = getXaxisValue(items[i].endTime);
			
			var itemInfo = {};
			itemInfo.startPos = x1;
			itemInfo.endPos = x2;
			itemInfo.reservationInfo = formatReservationInfo(items[i]);
			itemInfo.mrrId= items[i].mrrId;
			itemInfo.id= items[i].id;
			itemInfo.isCurrentUserItem= currentUser.id == items[i].user.id;
			if (isMyResView)
			{
				timeRangeData[items[i].mrId][cavDate].push(itemInfo);
			}
			else
			{
				timeRangeData[items[i].mrId].data.push(itemInfo);
			}
			drawTimeStamp(x1, x2, true, currentUser.id == items[i].user.id);
		}
		
	}
	else
	{
		var cavDate = getDateStrOrTimeStr(selectedDate);
		el.attr("day", cavDate);
	}
	
	/**
	 * Draw the ticks of time.
	 */
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

/**
 * Get the value of Xaxis by date string.
 * @param dateStr the date string to process.
 * @returns the value of Xaxis.
 */
function getXaxisValue(dateStr)
{
	var minutes = 0;
	var date = dateStr;
	if (typeof dateStr=="string")
	{
		dateStr = dateStr.replace(/-/g,"/").replace(/T/g," ");
		date = new Date(Date.parse(dateStr));
	}
	minutes += date.getHours()*60 + date.getMinutes();
	
	return parseInt((minutes-480)/2);
}

/**
 * Show the information of reservation.
 */
function showReservationInfo()
{
	if (!timeRangeData[this.id])
	{
		return;
	}
	
	var e = (arguments[0] == undefined)?window.event : arguments[0];
	var x = (e.offsetX == undefined) ? getOffset(e).X : e.offsetX;
	var data = null;
	if (isMyResView)
	{
		data = timeRangeData[this.id][$(this).attr("day")];
	}
	else
	{
		data = timeRangeData[this.id].data;
	}
	
	var p = $(this).position();
	for (var i = 0; i < data.length; i++)
	{
		if (data[i].startPos <= x && x <= data[i].endPos)
		{
			if ($('.tooltip-event').length > 0)
			{
				if ($('.tooltip-event').prop('id') != data[i].id)
				{
					$('.tooltip-event').html(data[i].reservationInfo);
				}
				$('.tooltip-event').css('top', e.pageY + 10);
				$('.tooltip-event').css('left', e.pageX + 20);
			}
			else
			{
				var tooltip = '<div id = "'+ data[i].id +'"class="tooltip-event">' + data[i].reservationInfo + '</div>';
				$("body").append(tooltip);
				$('.tooltip-event').css('top', e.pageY + 10);
				$('.tooltip-event').css('left', e.pageX + 20);
				$('.tooltip-event').fadeIn('500');
				$('.tooltip-event').fadeTo('10', 1.9);
			}
			return;
		}
	}
	
	hideReservationInfo();
}

/**
 * Hide the tooltips.
 */
function hideReservationInfo()
{
	$('.tooltip-event').remove();
}

/**
 * Edit avaliable/all meeting room reservation.
 */
function editReservation()
{
	var e = (arguments[0] == undefined)?window.event : arguments[0];
	e.preventDefault();
	hideReservationInfo();
	var currentDateX = getXaxisValue(new Date());
	var cavDay = getDateWithoutTime($(this).attr("day"));
	var isToday = cavDay.getTime() == getDateWithoutTime().getTime();
	if (cavDay.getTime() < getDateWithoutTime().getTime())
	{
		$(this).attr("data-toggle","hide");
		showDialog(errMsgs.commonWarnTitle, errMsgs.mrEditOldDayWarnMsg, true);
		return;
	}
	else if (!timeRangeData[this.id])
	{
		if (isToday)
		{
			var startPos = (currentDateX+2)*2;
			if (startPos < 600)
			{
				setStartOrEndTime((currentDateX+2)*2 + 480, true);
			}
			else
			{
				$(this).attr("data-toggle","hide");
				showDialog(errMsgs.commonWarnTitle, errMsgs.mrEditUnvaliableTodayWarnMsg, true);
				return;
			}
		}
		$("#startDateContainer input").val(getDateStrOrTimeStr(selectedDate, null));
		$(this).attr("data-toggle","modal");
		bookRoom(mrData[this.id].floor, mrData[this.id].id);
		return;
	}
	
	var x = (e.offsetX == undefined) ? getOffset(e).X : e.offsetX;
	var data = timeRangeData[this.id].data;
	
	processEditReservationPos(this, data, x, currentDateX);
}

/**
 * Edit my reservation.
 */
function editMyReservation()
{
	var e = (arguments[0] == undefined)?window.event : arguments[0];
	e.preventDefault();
	hideReservationInfo();
	var currentDateX = getXaxisValue(new Date());
	var cavDay = $(this).attr("day");
	var cavDate = getDateWithoutTime(cavDay);
	if (cavDate.getTime() < getDateWithoutTime().getTime())
	{
		$(this).attr("data-toggle","hide");
		showDialog(errMsgs.commonWarnTitle, errMsgs.mrEditOldDayWarnMsg, true);
		return;
	}
	
	var x = (e.offsetX == undefined) ? getOffset(e).X : e.offsetX;
	var data = timeRangeData[this.id][cavDay];
	
	processEditReservationPos(this, data, x, currentDateX);
}

/**
 * process the edit reservation event.
 * @param canvas the canvas to process.
 * @param data the data to process.
 * @param x the x position of mouse.
 * @param currentDateX  the x position of current date.
 */
function processEditReservationPos(canvas, data,x, currentDateX)
{
	var leftPos = 0, rightPos = 300,leftdist=[],rightdist=[];
	var msg = null;
	var cavDay = getDateWithoutTime($(canvas).attr("day"));
	var isToday = cavDay.getTime() == getDateWithoutTime().getTime();
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
					$(canvas).attr("data-toggle","modal");
					return;
				}
				else
				{
					msg = errMsgs.mrEditWarnMsg;
				}
			}
			
			$(canvas).attr("data-toggle","hide");
			showDialog(errMsgs.commonWarnTitle, msg, true);
			return;
		}
		else
		{
			if (data[i].endPos < x)
			{
				leftdist.push(data[i].endPos);
			}
			
			if (data[i].startPos > x)
			{
				rightdist.push(data[i].startPos);
			}
		}
	}
	
	if (leftdist.length > 0)
	{
		leftdist.sort();
		leftPos = leftdist[leftdist.length - 1];
	}
	
	if (rightdist.length > 0)
	{
		rightdist.sort();
		rightPos = rightdist[0];
	}
	
	if (isToday)
	{
		if (currentDateX + 10 > rightPos)
		{
			$(canvas).attr("data-toggle","hide");
			showDialog(errMsgs.commonWarnTitle, errMsgs.mrEditUnvaliableTodayWarnMsg, true);
			return;
		}
		else if (currentDateX > leftPos && currentDateX < rightPos)
		{
			leftPos = currentDateX;
		}
	}
	else if (leftPos + 10 >= rightPos)
	{
		$(canvas).attr("data-toggle","hide");
		showDialog(errMsgs.commonWarnTitle, errMsgs.mrEditUnvaliableTodayWarnMsg, true);
		return;
	}
		
	setStartOrEndTime((leftPos+2)*2 + 480, true);
	setStartOrEndTime((rightPos -2)*2 + 480, false);
	$("#startDateContainer input").val(getDateStrOrTimeStr(cavDay, null));
	$(canvas).attr("data-toggle","modal");
	bookRoom(mrData[canvas.id].floor, mrData[canvas.id].id);
}

/**
 * Cache the reservation.
 * @param items the items to process.
 */
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

/**
 * Get the reservation by date range and id of meeting room.
 * @param start the start time to get.
 * @param end the end time to get.
 * @param mrId the id of meeting room.
 * @param callback the function of call back.
 */
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

/**
 * Process the data for full calendar.
 * @param items the items to process.
 * @returns {Array}
 */
function processDataForCalender(items)
{
	var result = [];
	var data = null;
	if (items && items.length > 0)
	{
		var currentDate = new Date();
		var startDate = null;
		var endDate = null;
		var startStr = null;
		var endStr = null;
		for (var i = 0; i < items.length; i++)
		{
			data = {id:items[i].mrrId,title:items[i].resSubject.substring(0,6) +" "+ items[i].user.name,start:items[i].startTime,end:items[i].endTime};
			startStr = items[i].startTime.replace(/-/g,"/").replace(/T/g," ");
			startDate = new Date(Date.parse(startStr));
			endStr = items[i].endTime.replace(/-/g,"/").replace(/T/g," ");
			endDate = new Date(Date.parse(endStr));
			data.user = items[i].user.name;
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

/**
 * Get the full calendar of meeting rooom.
 */
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
			timeFormat:"HH:mm",
			contentHeight: 502,
			hiddenDays: [ 0, 6 ],
			eventLimit: true, 
			eventMouseover: function(calEvent, jsEvent) {
				var tooltipText = "Start date:" + calEvent.start.format("YYYY/MM/DD hh:mm a");
				tooltipText += "<br> End date: " + calEvent.end.format("YYYY/MM/DD hh:mm a");
				tooltipText += "<br> Ordered by: " + calEvent.user;
				var tooltip = '<div class="tooltip-event">' + tooltipText + '</div>';
				$("body").append(tooltip);
				$(this).mouseover(function(e) {
					$('.tooltip-event').fadeIn('500');
					$('.tooltip-event').fadeTo('10', 1.9);
				}).mousemove(function(e) {
					$('.tooltip-event').css('top', e.pageY + 10);
					$('.tooltip-event').css('left', e.pageX + 20);
				});
			},
			// Hide tooltip
			eventMouseout: function(calEvent, jsEvent) {
				$(this).css('z-index', 8);
				$('.tooltip-event').remove();
			},
			events: function(start, end, timezone, callback) {
				getReservationByDateRangeAndMrId(start, end, calMrId,callback);
			}
		});
	$( "#calendar" ).dialog({ width: 700,height:620,show: {
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

/**
 * Process the data of meeting room status.
 * @param mrTab meeting room reservation table to fill.
 * @param result the result of processed data.
 */
function processMeetingRooomStatusData(mrTab,result)
{
	mrTab.innerHTML="";
	var index = null;
	var row = null;
	var imgSource = null;
	myReservations = {};
	timeRangeData={};
	function compare()
	{
	    return function (object1, object2) {
	        var value1 = object1.meetingRoom.floor;
	        var value2 = object2.meetingRoom.floor;
	        if (value2 > value1) {
	            return -1;
	        } else if (value2 < value1) {
	            return 1;
	        } else {
	            return 0;
	        }
	    }

	}
	result.sort(compare());
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
		cel.appendChild($("<div class='panel panel-info'><div id='"+result[i].meetingRoom.id+"' class = 'panel-heading'> "+result[i].meetingRoom.name+"</div></div>").get(0));
		cel.appendChild($('<div> <a data-toggle="modal" data-target="#editLocation" onclick="initLocationEdit('+result[i].meetingRoom.id+',true)">'+result[i].meetingRoom.floor+'F '+result[i].meetingRoom.location+'</a></div>').get(0));
		cel = row.insertCell(index++);
		//cel.appendChild($("<img class = 'pull-left' src='img/phone.png' width='39' height='32' />").get(0));
		//cel.appendChild($("<img class = 'pull-left' src='img/recorder.png' width='39' height='32' />").get(0));
		if (result[i].meetingRoom.phoneExist)
		{
			cel.appendChild($("<img class = 'pull-left' src='img/recorder.png' width='39' height='32' />").get(0));
		}
		if (result[i].meetingRoom.projectorExist)
		{
			cel.appendChild($("<img class = 'pull-left' src='img/phone.png' width='39' height='32' />").get(0));
		}
		cel = row.insertCell(index++);
	    $(cel).addClass("align-bottom");
	    cel.appendChild($("<div> Seats#: "+result[i].meetingRoom.seats+"</div>").get(0));
		row.insertCell(index++).appendChild(getTodayStatus(result[i].timeIntervalItems, result[i].meetingRoom.id));
		row.insertCell(index++).innerHTML= getMrOperation(result[i].meetingRoom.floor, result[i].meetingRoom.id, result[i].meetingRoom.status);
		cacheReservationItems(result[i].reservationItems);
	}
}

/**
 * Process the data of my reservation.
 * @param mrTab my reservation table to fill.
 * @param result the result of processed data.
 */
function processMyReservationData(mrTab,result)
{
	mrTab.innerHTML="";
	var index = null;
	var row = null;
	var imgSource = null;
	myReservations = {};
	timeRangeData={};
	var m = 0;
	for(var i=0;i<result.length;i++)
	{
		row=mrTab.insertRow(m++);
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
		cel.appendChild($("<div class='panel panel-info'><div id='"+result[i].meetingRoom.id+"' class = 'panel-heading'> "+result[i].meetingRoom.name+"</div></div>").get(0));
		cel.appendChild($('<div> <a data-toggle="modal" data-target="#editLocation" onclick="initLocationEdit('+result[i].meetingRoom.id+')">'+result[i].meetingRoom.floor+'F '+result[i].meetingRoom.location+'</a></div>').get(0));
		cel = row.insertCell(index++);
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
	    var dateItems = classifyMRRItemsByDate(result[i].timeIntervalItems);
	    var dates = dateItems.dateArr.sort();
	    for (var j in dates)
	    {
	    	index = 0;
	    	row=mrTab.insertRow(m++);
	    	row.insertCell(index++).appendChild($("<div>"+ dates[j] +"</div>").get(0));
	    	row.insertCell(index++).appendChild(getTodayStatus(dateItems.data[dates[j]], result[i].meetingRoom.id));
	    	row.insertCell(index++).innerHTML= getMyMrOperation(dateItems.data[dates[j]]);
	    }
	   
		cacheReservationItems(result[i].reservationItems);
	}
}

/**
 * Load avaliable meeting room status.
 */
function loadAvaliableMeetingRoomStatus()
{
	if (!isAvaliableView || isMyResView)
	{
		isMyResView = false;
		isAvaliableView = true;
		$("#mrrDatePicker").text("Current Date: " + getDateStrOrTimeStr(selectedDate, null));
	}
	
	$.get("ws/meetingroomReservation/reservation/"+selectedDate.getTime(), function (result) {
		var mrTab=document.getElementById("avaliableMeetingRoomStatus");
		processMeetingRooomStatusData(mrTab,result);
		$("#avaliableMeetingRoomStatus tr td img.mrr-image").click(getMRCalender);
		$("#avaliableMeetingRoomStatus tr td div div.panel-heading").click(getMRCalender);
		$("#avaliableMeetingRoomStatus canvas").mousemove(showReservationInfo);
		$("#avaliableMeetingRoomStatus canvas").mouseout(hideReservationInfo);
		$("#avaliableMeetingRoomStatus canvas").click(editReservation);
	});

}


/**
 * Load all meeting room status.
 */
function loadAllMeetingRoomStatus()
{
	if (isAvaliableView || isMyResView)
	{
		isMyResView = false;
		isAvaliableView = false;
		$("#allMrrDatePicker").text("Current Date: " + getDateStrOrTimeStr(selectedDate, null));
	}
	$.get("ws/meetingroomReservation/"+selectedDate.getTime(), function (result) {
		var mrTab=document.getElementById("allMeetingRoomStatus");
		processMeetingRooomStatusData(mrTab,result);
		$("#allMeetingRoomStatus tr td img.mrr-image").click(getMRCalender);
		$("#allMeetingRoomStatus tr td div div.panel-heading").click(getMRCalender);
		$("#allMeetingRoomStatus canvas").mousemove(showReservationInfo);
		$("#allMeetingRoomStatus canvas").mouseout(hideReservationInfo);
		$("#allMeetingRoomStatus canvas").click(editReservation);
	});

}

/**
 * Classify the items of my reservation by date.
 * @param items the items to process.
 * @returns {___anonymous43845_43874}
 */
function classifyMRRItemsByDate(items)
{
	var mrrDate = {};
	var dateArr = [];
	var dateItems = null;
	var dateStr = null;
	for (var i = 0; i < items.length; i++)
	{
		dateStr = getDateStrOrTimeStr(items[i].startTime);
		dateItems = mrrDate[dateStr];
		if (dateItems)
		{
			dateItems.push(items[i]);
		}
		else
		{
			dateArr.push(dateStr); 
			dateItems = mrrDate[dateStr]= [];
			dateItems.push(items[i]);
		}
	}
	
	return {data:mrrDate,dateArr:dateArr};
}

/**
 * Load my reservation status.
 */
function loadMyReservaion()
{
	isMyResView = true;
	$.get("ws/meetingroomReservation/user/"+currentUser.id, function (mrrData) {
		var mrTab=$("#myReservation").get(0);
		mrTab.innerHTML="";
		processMyReservationData(mrTab,mrrData);
		 $(".resDeleteBtn").click(getMyReservationDialog);
		$("#myReservation tr td img.mrr-image").click(getMRCalender);
		$("#myReservation tr td div div.panel-heading").click(getMRCalender);
		$("#myReservation canvas").mousemove(showReservationInfo);
		$("#myReservation canvas").mouseout(hideReservationInfo);
		$("#myReservation canvas").click(editMyReservation);
	  });
}

/**
 * Parse the time string to get the minutes.
 * @param timeStr the time string to process.
 * @returns {Number} the minutes of time string.
 */
function parseTimeStr(timeStr)
{
	var ti = 0;
	if (timeStr && timeStr.length > 0)
	{
		var t = timeStr.split(":");
		ti += t[0]*60;
		ti += t[1]*1;
	}
	
	return ti;
}

/**
 * Set the value of start or end time label.
 * @param minutes the minutes to set.
 * @param isStartTime the flag to distinguish the minutes value is start or end time.
 */
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

/**
 * The function for handle grag event of mouse for time interval of reservation.
 */
function dragTime()
{
	var Isclick = false, zindex = 2;
	smallbar.css({"width":"100%","left":0});
	arrbtn.get(0).style.left = 0;
	arrbtn.get(1).style.left = 100 + "%";
	var isMinTimeBtn,maxlenght,lenght, startX,btnlenght;
	arrbtn.mousedown(timeMouseDown);
	
	/**
	 * Handle the mouse down event.
	 */
	function timeMouseDown()
	{
		isMinTimeBtn = this.id == "minTimeBtn";
		if (!maxwidth)
		{
			maxwidth = $("#dragbar").prop("offsetWidth");
		}
		var e = (arguments[0] == undefined)?window.event : arguments[0];
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
	
	/**
	 * Handle the mouse move event.
	 */
	function timeMouseMove()
	{
		var e = (arguments[0] == undefined)?window.event : arguments[0];
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
	
	/**
	 * Handle the mouse up event.
	 */
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

/**
 * The small width of start and end time.
 */
function smallwidth()
{
	var left = parseFloat(arrbtn.get(0).style.left);
	var right = parseFloat(arrbtn.get(1).style.left);
	smallbar.get(0).style.width = (right - left > 0 ? Math.floor(right - left) : 0)
	+ "%";
}

/**
 * Update the time after the grag event of mouse for time interval
 * @param obj the element to update.
 * @param leftVal the left percent of css to set.
 */
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

/**
 * The function for solve the problem of firefox.
 * The offsetX and offsetY are not supported for firefox, so use other way to 
 * calculate the offset of x and y for current element click event.
 * @param e the event to process.
 * @returns {___anonymous48471_48546}
 */
function getOffset(e)
{
  var target = e.target, 
      eventCoord,
      pageCoord,
      offsetCoord;

  // Get the distance between current element and the left of document.
  pageCoord = getPageDistance(target);

  // calculate the distance between mouse and document.
  eventCoord = {
    X : window.pageXOffset + e.clientX,
    Y : window.pageYOffset + e.clientY
  };

  // Get the distance of the first parent element which one has position.
  offsetCoord = {
    X : eventCoord.X - pageCoord.X,
    Y : eventCoord.Y - pageCoord.Y
  };
  return offsetCoord;
}

function getPageDistance(element){
  var coord = { X : 0, Y : 0 };
  // Get all the distance of element util the root element.
  // every level offsetParent of element, offsetLeft or offsetTop added.
  while (element){
    coord.X += element.offsetLeft;
    coord.Y += element.offsetTop;
    element = element.offsetParent;
  }
  return coord;
}

/**
 * The date time picker don't work well for Bootstrap V 3.0,
 * the "previous" and "next" icon don't display, here we just
 * manually add the style for it
 */
function fixDatetimePickerArrowImgIssue(){
	$(".icon-arrow-left").addClass("glyphicon");
	$(".icon-arrow-left").addClass("glyphicon-arrow-left");
	$(".icon-arrow-right").addClass("glyphicon");
	$(".icon-arrow-right").addClass("glyphicon-arrow-right");
}

initMRResElement();
loadMeetingRooms();
loadAvaliableMeetingRoomStatus();
dragTime();
fixDatetimePickerArrowImgIssue();