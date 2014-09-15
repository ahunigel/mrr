package com.ect.util;

import java.util.Calendar;
import java.util.Date;

import com.ect.domainobject.MeetingRoomReservation;
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
		
		if (day1 > day2)
		{
			return day1 - day2;
		}
		
		return day2 - day1;
	}
	
	public static int getRecurrentCount(MeetingRoomReservation mrr)
	{
		int recurrentCount = 1;
		if (mrr.getReservationType().equals(ReservationType.SINGLE))
		{
			return recurrentCount ;
		}
		else if (mrr.getReservationType().equals(ReservationType.RECURRENT))
		{
			switch (mrr.getRecurrentType())
			{
				case DAILY:
					recurrentCount = recurrentCount * mrr.getRecurrentInterval();
					break;
				case DAILY_WORKDAY:
					recurrentCount = 7 * mrr.getRecurrentInterval();
					break;
				case WEEKLY:
					recurrentCount = 7 * mrr.getRecurrentInterval();
					break;
				case MONTHLY:
					recurrentCount = 0;
					break;
				default:
					break;
			}
		}
		
		return recurrentCount;
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
	
	public static boolean isSingleDayInDateRange(Date singleDate, MeetingRoomReservation mrr)
	{
		singleDate = getDateWithoutTime(singleDate);
		Date startDate = getDateWithoutTime(mrr.getStartTime());
		Date endDate = getDateWithoutTime(mrr.getEndTime());
		if (mrr.getReservationType().equals(ReservationType.SINGLE))
		{
			
		}
		else if (mrr.getReservationType().equals(ReservationType.RECURRENT))
		{
			switch (mrr.getRecurrentType())
			{

				case DAILY:
					
					break;
				case DAILY_WORKDAY:
	
					break;
				case WEEKLY:
	
					break;
	
				case MONTHLY:
	
					break;
	
				default:
					break;
			}
		}
		return false;
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
	
}
