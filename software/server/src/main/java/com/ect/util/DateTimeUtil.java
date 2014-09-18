package com.ect.util;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.RecurrentType;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.domainobject.ReservationType;

public class DateTimeUtil 
{

	public static int getIntervalDaysBetweenDates(Date startDate, Date endDate)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(startDate);
		int day1 = cal.get(Calendar.DAY_OF_YEAR);
		cal.setTime(endDate);
		int day2 = cal.get(Calendar.DAY_OF_YEAR);
		
		return day2 - day1;
	}
	
	
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
	
	public static Date getDateWithoutTime(Date date)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.set(Calendar.HOUR, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		
		return cal.getTime();
	}
	
	public static Date getAddedDaysDate(Date date, int addDays){
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.add(Calendar.DAY_OF_MONTH, addDays);
		return cal.getTime();
	}
	
	public static boolean isSameDayIgnoreMonthAndYear(Date targetDate, Date comparedDate)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(targetDate);
		int day1 = cal.get(Calendar.DAY_OF_MONTH);
		cal.setTime(comparedDate);
		int day2 = cal.get(Calendar.DAY_OF_MONTH);
		
		return day1 == day2;
	}
	
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

	public static Date getAddedTimeDate(Date date, int timeMunites)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.set(Calendar.HOUR, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		cal.add(Calendar.MINUTE, timeMunites);
		
		return cal.getTime();
	}
	
	public static Date getAddedMonthDate(Date date, int month)
	{
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		cal.add(Calendar.MONTH, month);
		return cal.getTime();
	}

	public static ReservationTimeIntervalItemBean getFirstRunTimeRecordOfReservation(MeetingRoomReservation res)
	{
		Date nextRunStartTime = res.getStartTime();
		Date nextRunEndtime = res.getStartTime();
		if (!res.getReservationType().equals(ReservationType.SINGLE))
		{
			nextRunStartTime = getAddedTimeDate(nextRunStartTime,res.getRecurrentStartTime());
			nextRunEndtime = getAddedTimeDate(nextRunEndtime,res.getRecurrentEndTime());
		}
		
		ReservationTimeIntervalItemBean reservartionItem = new ReservationTimeIntervalItemBean();
		reservartionItem.setMeetingRoom(res.getMeetingRoom());
		reservartionItem.setReservation(res);
		reservartionItem.setStartTime(nextRunStartTime);
		reservartionItem.setEndTime(nextRunEndtime);
		
		return reservartionItem;
	}
	
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
	
	public static List<ReservationTimeIntervalItemBean> getReservationTimeIntervalRecords(MeetingRoomReservation res) 
	{
		List<ReservationTimeIntervalItemBean> items = new ArrayList<ReservationTimeIntervalItemBean>();
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


	private static List<ReservationTimeIntervalItemBean> getRecurrentReservationRecords(
			MeetingRoomReservation res, ReservationTimeIntervalItemBean resItem) {
		List<ReservationTimeIntervalItemBean> items = new ArrayList<ReservationTimeIntervalItemBean>();
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


	private static int getRepeatCountForReservation(MeetingRoomReservation res)
	{
		int intervalDays = getIntervalDaysBetweenDates(res.getStartTime(), res.getEndTime());
		int repeatCount = 0;
		switch (res.getRecurrentType()) {
		case DAILY:
		case DAILY_WORKDAY:	
			repeatCount = intervalDays / res.getRecurrentInterval();
			break;
		case WEEKLY:
			repeatCount = intervalDays / (res.getRecurrentInterval()*7);
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
