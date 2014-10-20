package com.ect.vo;

import java.io.Serializable;
import java.util.Date;

public class ReservationTimeIntervalItemVO implements Serializable
{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/**
	 * The id of time interval item.
	 */
	private long id;
	/**
	 * The reservation of time interval item.
	 */
	private Integer mrrId;
	/**
	 * The meeting room of reservation item.
	 */
	private Integer mrId;
	/**
	 * The start time of reservation include date and time.
	 */
	private Date startTime;
	/**
	 * The end time of reservation include date and time.
	 */
	private Date endTime;
	
	private UserVO user;
	
	public long getId()
	{
		return id;
	}
	public void setId(long id)
	{
		this.id = id;
	}
	public Integer getMrrId()
	{
		return mrrId;
	}
	public void setMrrId(Integer mrrId)
	{
		this.mrrId = mrrId;
	}
	public Integer getMrId()
	{
		return mrId;
	}
	public void setMrId(Integer mrId)
	{
		this.mrId = mrId;
	}
	public Date getStartTime()
	{
		return startTime;
	}
	public void setStartTime(Date startTime)
	{
		this.startTime = startTime;
	}
	public Date getEndTime()
	{
		return endTime;
	}
	public void setEndTime(Date endTime)
	{
		this.endTime = endTime;
	}
	public UserVO getUser()
	{
		return user;
	}
	public void setUser(UserVO user)
	{
		this.user = user;
	}        
}
