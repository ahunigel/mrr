package com.ect.domainobject;

import java.util.Date;

public class TimeInterval 
{
	private Date startDate;
	private Date endDate;
	private boolean isAvaliableInterval = true;
	private int avaliableIntervalMillionSeconds = 30 * 60 * 1000;
	
	public Date getStartDate()
	{
		return startDate;
	}
	public void setStartDate(Date startDate)
	{
		this.startDate = startDate;
	}
	public Date getEndDate()
	{
		return endDate;
	}
	public void setEndDate(Date endDate)
	{
		this.endDate = endDate;
	}
	public boolean isAvaliableInterval()
	{
		if (startDate != null && endDate != null && (endDate.getTime() - startDate.getTime()) < avaliableIntervalMillionSeconds)
		{
			isAvaliableInterval = false;
		}
		return isAvaliableInterval;
	}
	public void setAvaliableInterval(boolean isAvaliableInterval)
	{
		this.isAvaliableInterval = isAvaliableInterval;
	}
	public int getAvaliableIntervalMillionSeconds()
	{
		return avaliableIntervalMillionSeconds;
	}
	public void setAvaliableIntervalMillionSeconds(
			int avaliableIntervalMillionSeconds)
	{
		this.avaliableIntervalMillionSeconds = avaliableIntervalMillionSeconds;
	}		
}