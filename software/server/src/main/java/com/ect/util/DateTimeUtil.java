package com.ect.util;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

import com.ect.domainobject.ITimeIntervalRecord;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.RecurrentType;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.domainobject.ReservationType;

/**
 * The util class for reservation.
 * 
 * @author Angel.Fu
 *
 */
public class DateTimeUtil 
{

	/**
	 * Get the interval days between the start date and end date.
	 * @param startDate the start date to be compared.
	 * @param endDate the end date to be compared.
	 * @return the interval days between the start date and end date.
	 */
	public static int getIntervalDaysBetweenDates(Date startDate, Date endDate)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(startDate);
		int day1 = cal.get(Calendar.DAY_OF_YEAR);
		cal.setTime(endDate);
		int day2 = cal.get(Calendar.DAY_OF_YEAR);
		
		return day2 - day1;
	}
	
	/**
	 * Check if the given date is working day or not.
	 * @param date the date to check if it is working day.
	 * @return <code>true<code> it is working day.
	 */
	public static boolean isWorkingDay(Date date)
	{
		boolean isWorkingDay = true;
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		int dayNum = cal.get(Calendar.DAY_OF_WEEK);
		if (dayNum == 5 || dayNum == 6)
		{
			isWorkingDay = false;
		}
		
		return isWorkingDay;
	}
	
	/**
	 * Get the current GMT date without time.
	 */
	public static Date getCurrentGMTDateWithoutTime()
	{
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		cal.setTimeInMillis(cal.getTimeInMillis() - TimeZone.getDefault().getRawOffset());
		
		return cal.getTime();
	}
	
	public static Date getGMTDateTime(Date date)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTimeInMillis(date.getTime() - TimeZone.getDefault().getRawOffset());
		return cal.getTime();
	}
	
	/**
	 * Get the date without time.
	 * @param date the  date to process.
	 * @return the date without time.
	 */
	public static Date getDateWithoutTime(Date date)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		
		return cal.getTime();
	}
	
	/**
	 * Get the date with added days.
	 * @param date the date to process.
	 * @param addDays the count of days to add.
	 * @return the date with added days.
	 */
	public static Date getAddedDaysDate(Date date, int addDays){
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.add(Calendar.DAY_OF_MONTH, addDays);
		return cal.getTime();
	}
	
	/**
	 * Get the date with added days.
	 * @param date the date to process.
	 * @param hours the number of hours to add.
	 * @param minutes the number of hours to add.
	 * @return the date with added days.
	 */
	public static Date getAddedTimeDate(Date date, int hours, int minutes){
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.add(Calendar.HOUR_OF_DAY, hours);
		cal.add(Calendar.MINUTE, minutes);
		return cal.getTime();
	}
	
	/**
	 * Check if the given target date and compared date is the same day in the month.
	 * such as 03/15/2014 and 04/15/2014 is the same day in the month.
	 * @param targetDate the target date to be compared.
	 * @param comparedDate the compared date to be compared.
	 * @return <code>true<code>it is the same day in the month.
	 */
	public static boolean isSameDayIgnoreMonthAndYear(Date targetDate, Date comparedDate)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(targetDate);
		int day1 = cal.get(Calendar.DAY_OF_MONTH);
		cal.setTime(comparedDate);
		int day2 = cal.get(Calendar.DAY_OF_MONTH);
		
		return day1 == day2;
	}
	
	/**
	 * Get the lowest common multiple number between two numbers.
	 * @param targetNum  the target number to process.
	 * @param compareNum the compared number to process.
	 * @return the lowest common multiple number between two numbers.
	 */
	public static int getLowestCommonMultiple(int targetNum, int compareNum)
	{
		int m = targetNum,n = compareNum;
		if (m < n) {
            int temp = m;  
            m = n;  
            n = temp;  
        }  
        while (m % n != 0) {
            int temp = m % n;  
            m = n;  
            n = temp;  
        }  
        
		return targetNum * compareNum / n;  
	}

	/**
	 * Get the date with added time.
	 * @param date the date to process.
	 * @param timeMunites the minutes to add.
	 * @return the date with added time.
	 */
	public static Date getAddedTimeDate(Date date, int timeMunites)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		cal.add(Calendar.MINUTE, timeMunites);
		
		return cal.getTime();
	}
	
	/**
	 * Get the date with added month.
	 * @param date the date to process.
	 * @param month the month to add.
	 * @return  the date with added month.
	 */
	public static Date getAddedMonthDate(Date date, int month)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.add(Calendar.MONTH, month);
		return cal.getTime();
	}

	/**
	 * Get the first time interval item of reservation by the given reservation.
	 * @param res the reservation to process.
	 * @return the first time interval item of reservation by the given reservation.
	 */
	public static ReservationTimeIntervalItemBean getFirstRunTimeRecordOfReservation(MeetingRoomReservation res)
	{
		Date nextRunStartTime = res.getStartTime();
		Date nextRunEndtime = res.getEndTime();
		if (!res.getReservationType().equals(ReservationType.SINGLE))
		{
			nextRunStartTime = getAddedTimeDate(nextRunStartTime,res.getRecurrentStartTime());
			nextRunEndtime = getAddedTimeDate(nextRunStartTime,res.getRecurrentEndTime());
		}
		
		ReservationTimeIntervalItemBean reservartionItem = new ReservationTimeIntervalItemBean();
		reservartionItem.setMeetingRoom(res.getMeetingRoom());
		reservartionItem.setReservation(res);
		reservartionItem.setStartTime(nextRunStartTime);
		reservartionItem.setEndTime(nextRunEndtime);
		
		return reservartionItem;
	}
	
	/**
	 * Get the copied time interval item and change the start and end time.
	 * @param item the item to process.
	 * @param addDays the count of day to add.
	 * @param addMonth the count of month to add.
	 * @return the copied time interval item and change the start and end time.
	 */
	public static ReservationTimeIntervalItemBean getCopiedReservationItem (ReservationTimeIntervalItemBean item, int addDays, int addMonth)
	{
		Date nextRunStartTime = null; 
		Date nextRunEndtime = null;
		if (addMonth > 0)
		{
			nextRunStartTime = getAddedMonthDate(item.getStartTime(), addMonth);
			nextRunEndtime = getAddedMonthDate(item.getEndTime(),addMonth);
		}
		else
		{
			nextRunStartTime = getAddedDaysDate(item.getStartTime(), addDays);
			nextRunEndtime = getAddedDaysDate(item.getEndTime(),addDays);
		}
		
		ReservationTimeIntervalItemBean reservartionItem = new ReservationTimeIntervalItemBean();
		reservartionItem.setMeetingRoom(item.getMeetingRoom());
		reservartionItem.setReservation(item.getReservation());
		reservartionItem.setStartTime(nextRunStartTime);
		reservartionItem.setEndTime(nextRunEndtime);
		
		return reservartionItem;
	}
	
	/**
	 * Get the time interval items by the given reservation.
	 * @param res the reservation to process.
	 * @return the time interval items by the given reservation.
	 */
	public static List<ITimeIntervalRecord> getReservationTimeIntervalRecords(MeetingRoomReservation res) 
	{
		List<ITimeIntervalRecord> items = new ArrayList<ITimeIntervalRecord>();
		ReservationTimeIntervalItemBean resItem = getFirstRunTimeRecordOfReservation(res);
		if (res.getReservationType().equals(ReservationType.SINGLE))
		{
			items.add(resItem);
			return items;
		}
		else
		{
			items = getRecurrentReservationRecords(
					res, resItem);
		}
		
		return items;
	}

	/**
	 * Get the time interval items of the recurrent reservation.
	 * @param res the reservation to process.
	 * @param resItem the time interval item of reservation.
	 * @return the time interval items of the recurrent reservation.
	 */
	private static List<ITimeIntervalRecord> getRecurrentReservationRecords(
			MeetingRoomReservation res, ReservationTimeIntervalItemBean resItem) {
		List<ITimeIntervalRecord> items = new ArrayList<ITimeIntervalRecord>();
		RecurrentType recurrentType = res.getRecurrentType();
		boolean isDailyWorkingDay = recurrentType.equals(RecurrentType.DAILY_WORKDAY);
		if (!isDailyWorkingDay || isDailyWorkingDay && isWorkingDay(resItem.getStartTime()))
		{
			items.add(resItem);
		}
		
		int repeatCount = getRepeatCountForReservation(res);
		
		if (repeatCount > 0)
		{
			int addDays = res.getRecurrentInterval();
			for (int i = 1; i < repeatCount; i++)
			{
				resItem = getCopiedReservationItem(resItem, addDays, -1);
				if (!isDailyWorkingDay || isDailyWorkingDay && isWorkingDay(resItem.getStartTime()))
				{
					items.add(resItem);
				}
			}
		}
		else
		{
			for (int i = 1; i < repeatCount; i++)
			{
				resItem = getCopiedReservationItem(resItem, 0, res.getRecurrentInterval());
				items.add(resItem);
			}
		}
		return items;
	}

	/**
	 * Get the repeat count of recurrent reservation.
	 * @param res the reservation to process.
	 * @return the repeat count of recurrent reservation.
	 */
	private static int getRepeatCountForReservation(MeetingRoomReservation res)
	{
		int intervalDays = getIntervalDaysBetweenDates(res.getStartTime(), res.getEndTime());
		int repeatCount = 1;
		switch (res.getRecurrentType()) {
		case DAILY:
		case DAILY_WORKDAY:	
			repeatCount += intervalDays / res.getRecurrentInterval();
			break;
		case WEEKLY:
			repeatCount += intervalDays / (res.getRecurrentInterval()*7);
			break;
		case MONTHLY:
			repeatCount = -1;
			break;
		default:
			break;
		}
		
		return repeatCount;
	}	
}
