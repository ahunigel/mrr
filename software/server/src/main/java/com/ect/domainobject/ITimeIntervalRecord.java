package com.ect.domainobject;

import java.util.Date;


/**
 * The interface class for time interval items.
 * 
 * @author Angel.Fu
 *
 */

public interface ITimeIntervalRecord 
{

	/**
	 * Get the reservation of time interval item.
	 * @return the reservation of time interval item.
	 * 
	 */

	public MeetingRoomReservation getReservation();
	/**
	 * Set the reservation of time interval item.
	 * @param reservation the reservation of time interval item to set.
	 */
	public void setReservation(MeetingRoomReservation reservation);
	
	/**
	 * Get the meeting room of time interval item.
	 * @return the meeting room of time interval item.
	 * 
	 */
	public MeetingRoom getMeetingRoom();
	
	/**
	 * Set the meeting room of time interval item.
	 * @param meetingRoom the meeting room of time interval item to set.
	 */
	public void setMeetingRoom(MeetingRoom meetingRoom);
	
	/**
	 * Get the start time of each reservation.
	 * @return the start time of each reservation.
	 * 
	 */
	public Date getStartTime();
	
	/**
	 * Set the start time of each reservation.
	 * @param startTime the start time of each reservation to set.
	 */
	public void setStartTime(Date startTime);
	
	/**
	 * Get the end time of each reservation.
	 * @return the end time of each reservation.
	 * 
	 */
	public Date getEndTime();
	
	/**
	 * Set the end time of each reservation.
	 * @param endTime the end time of each reservation.
	 */
	public void setEndTime(Date endTime);

}
