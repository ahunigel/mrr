package com.ect.vo;

import java.io.Serializable;
import java.util.Date;
import java.util.List;


public class MeetingRoomStatusVO implements Serializable{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private Integer id;
		
	/**
	 * reserver start time, 
	 * if the reservation type is SINGLE, this field is date and time;
	 * if the reservation type is RECURRENT, this field is date; time use the field recurrentStartTime
	 */
	private Date startTime;
	
	/**
	 * reserver end time, 
	 * if the reservation type is SINGLE, this field is date and time;
	 * if the reservation type is RECURRENT, this field is date; time use the field recurrentEndTime
	 */
	private Date endTime;
	
	private MeetingRoomVO meetingRoom;
	
	private List<MeetingRoomReservationVO> reservationItems;
	
	private List<ReservationTimeIntervalItemVO> timeIntervalItems;

	
	public Integer getId()
	{
		return id;
	}

	public void setId(Integer id)
	{
		this.id = id;
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

	public MeetingRoomVO getMeetingRoom()
	{
		return meetingRoom;
	}

	public void setMeetingRoom(MeetingRoomVO meetingRoom)
	{
		this.meetingRoom = meetingRoom;
	}

	public List<MeetingRoomReservationVO> getReservationItems()
	{
		return reservationItems;
	}

	public void setReservationItems(List<MeetingRoomReservationVO> reservationItems)
	{
		this.reservationItems = reservationItems;
	}

	public List<ReservationTimeIntervalItemVO> getTimeIntervalItems()
	{
		return timeIntervalItems;
	}

	public void setTimeIntervalItems(
			List<ReservationTimeIntervalItemVO> timeIntervalItems)
	{
		this.timeIntervalItems = timeIntervalItems;
	}
	
	
}
