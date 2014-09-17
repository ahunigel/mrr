package com.ect.domainobject;

import java.util.Date;

public class ReservationTimeIntervalItemBean 
{
	private MeetingRoomReservation reservation;
	private MeetingRoom meetingRoom;
	private Date startTime;
	private Date EndTime;
	
	
	public MeetingRoomReservation getReservation() {
		return reservation;
	}
	public void setReservation(MeetingRoomReservation reservation) {
		this.reservation = reservation;
	}
	public MeetingRoom getMeetingRoom() {
		return meetingRoom;
	}
	public void setMeetingRoom(MeetingRoom meetingRoom) {
		this.meetingRoom = meetingRoom;
	}
	public Date getStartTime() {
		return startTime;
	}
	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}
	public Date getEndTime() {
		return EndTime;
	}
	public void setEndTime(Date endTime) {
		EndTime = endTime;
	}
	
	

}
