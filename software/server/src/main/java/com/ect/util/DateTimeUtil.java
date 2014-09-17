package com.ect.util;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationTimeIntervalItemBean;

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
		/*cal.set(Calendar.HOUR, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);*/
		cal.add(Calendar.MINUTE, timeMunites);
		
		return cal.getTime();
	}

	public static ReservationTimeIntervalItemBean getFirstRunTimeRecordOfReservation(MeetingRoomReservation res)
	{
		Date nextRunStartTime =getAddedTimeDate(res.getStartTime(),res.getRecurrentStartTime());
		Date nextRunEndtime = getAddedTimeDate(res.getStartTime(),res.getRecurrentEndTime());
		ReservationTimeIntervalItemBean reservartionItem = new ReservationTimeIntervalItemBean();
		reservartionItem.setMeetingRoom(res.getMeetingRoom());
		reservartionItem.setReservation(res);
		reservartionItem.setStartTime(nextRunStartTime);
		reservartionItem.setEndTime(nextRunEndtime);
		
		return reservartionItem;
	}
	
	public static ReservationTimeIntervalItemBean getCopiedReservationItem (ReservationTimeIntervalItemBean item, int addDays)
	{
		Date nextRunStartTime = getAddedDaysDate(item.getStartTime(), addDays);
		Date nextRunEndtime = getAddedDaysDate(item.getEndTime(),addDays);
		ReservationTimeIntervalItemBean reservartionItem = new ReservationTimeIntervalItemBean();
		reservartionItem.setMeetingRoom(item.getMeetingRoom());
		reservartionItem.setReservation(item.getReservation());
		reservartionItem.setStartTime(nextRunStartTime);
		reservartionItem.setEndTime(nextRunEndtime);
		
		return reservartionItem;
	}
	
	public static List<ReservationTimeIntervalItemBean> getDailyReservationTimeIntervalRecords(MeetingRoomReservation res) 
	{
		List<ReservationTimeIntervalItemBean> items = new ArrayList<ReservationTimeIntervalItemBean>();
		ReservationTimeIntervalItemBean firstItem = getFirstRunTimeRecordOfReservation(res);
		items.add(firstItem);
		int intervalDays = getIntervalDaysBetweenDates(res.getStartTime(), res.getEndTime());
		int repeatCount = intervalDays / res.getRecurrentInterval();
		int addDays = res.getRecurrentInterval();
		for (int i = 1; i < repeatCount; i++)
		{
			firstItem = getCopiedReservationItem(firstItem, addDays);
			items.add(firstItem);
		}
		
		return items;
	}
	
}
