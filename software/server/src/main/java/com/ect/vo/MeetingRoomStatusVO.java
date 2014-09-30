package com.ect.vo;

import java.util.Date;
import java.util.List;


public class MeetingRoomStatusVO {
	
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
	
	private List<MeetingRoomReservationVO> items;

	
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

	public List<MeetingRoomReservationVO> getItems()
	{
		return items;
	}

	public void setItems(List<MeetingRoomReservationVO> items)
	{
		this.items = items;
	}
	
	

}
