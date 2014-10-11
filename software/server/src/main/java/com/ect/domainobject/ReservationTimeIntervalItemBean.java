package com.ect.domainobject;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * The class for time interval items of meeting room reservation. Each item is
 * the single reservation of meeting room.
 * 
 * @author Angel.Fu
 *
 */

@Entity
@NamedQueries({
		@NamedQuery(name = "getItemsByTimeInterval", query = "select r from ReservationTimeIntervalItemBean r where r.startTime <=:startTime and r.endTime >=:endTime"),
		@NamedQuery(name = "getItemsByTimeIntervalAndUser", query = "select r from ReservationTimeIntervalItemBean r where r.startTime <=:startTime and r.endTime >=:endTime and reservation.reservedPerson.id=:userId"),
		@NamedQuery(name = "getItemsByMeetingRoom", query = "select r from ReservationTimeIntervalItemBean r where r.meetingRoom.id=:mrId"),
		@NamedQuery(name = "getItemsByReservation", query = "select r from ReservationTimeIntervalItemBean r where r.reservation.id=:mrrId"),
		@NamedQuery(name = "getItemsByTimeIntervalAndMeetingRoom", query = "select r from ReservationTimeIntervalItemBean r where r.startTime <=:startTime and r.endTime >=:endTime and r.meetingRoom.id=:mrId"),
		@NamedQuery(name = "getItemsByTimeIntervalAndReservation", query = "select r from ReservationTimeIntervalItemBean r where r.startTime <=:startTime and r.endTime >=:endTime and r.reservation.id=:mrrId"),
		@NamedQuery(name = "checkItemByTimeIntervalAndMeetingRoom", query = "select r from ReservationTimeIntervalItemBean r where ( (r.startTime >=:startTime and r.startTime <=:endTime) or"
				+ "  (r.endTime >=:startTime and r.endTime <=:endTime)) and r.meetingRoom.id=:mrId")

})
@Table(name = "reservation_item")
public class ReservationTimeIntervalItemBean implements ITimeIntervalRecord
{
	/**
	 * The id of time interval item.
	 */
	private long id;
	/**
	 * The reservation of time interval item.
	 */
	private MeetingRoomReservation reservation;
	/**
	 * The meeting room of reservation item.
	 */
	private MeetingRoom meetingRoom;
	/**
	 * The start time of reservation include date and time.
	 */
	private Date startTime;
	/**
	 * The end time of reservation include date and time.
	 */
	private Date endTime;

	/**
	 * Get the id of time interval item.
	 * 
	 * @return the id of time interval item.
	 * 
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public long getId()
	{
		return id;
	}

	/**
	 * Set the id of time interval item.
	 * 
	 * @param id
	 *            the id of time interval item to set.
	 */
	public void setId(long id)
	{
		this.id = id;
	}

	/**
	 * Get the reservation of time interval item.
	 * 
	 * @return the reservation of time interval item.
	 * 
	 */
	@ManyToOne
	@JoinColumn(name = "meeting_room_reservation_id")
	public MeetingRoomReservation getReservation()
	{
		return reservation;
	}

	/**
	 * Set the reservation of time interval item.
	 * 
	 * @param reservation
	 *            the reservation of time interval item to set.
	 */
	public void setReservation(MeetingRoomReservation reservation)
	{
		this.reservation = reservation;
	}

	/**
	 * Get the meeting room of time interval item.
	 * 
	 * @return the meeting room of time interval item.
	 * 
	 */
	@ManyToOne
	@JoinColumn(name = "meeting_room_id")
	public MeetingRoom getMeetingRoom()
	{
		return meetingRoom;
	}

	/**
	 * Set the meeting room of time interval item.
	 * 
	 * @param meetingRoom
	 *            the meeting room of time interval item to set.
	 */
	public void setMeetingRoom(MeetingRoom meetingRoom)
	{
		this.meetingRoom = meetingRoom;
	}

	/**
	 * Get the start time of each reservation.
	 * 
	 * @return the start time of each reservation.
	 * 
	 */
	@Temporal(TemporalType.TIMESTAMP)
	public Date getStartTime()
	{
		return startTime;
	}

	/**
	 * Set the start time of each reservation.
	 * 
	 * @param startTime
	 *            the start time of each reservation to set.
	 */
	public void setStartTime(Date startTime)
	{
		this.startTime = startTime;
	}

	/**
	 * Get the end time of each reservation.
	 * 
	 * @return the end time of each reservation.
	 * 
	 */
	@Temporal(TemporalType.TIMESTAMP)
	public Date getEndTime()
	{
		return endTime;
	}

	/**
	 * Set the end time of each reservation.
	 * 
	 * @param endTime
	 *            the end time of each reservation.
	 */
	public void setEndTime(Date endTime)
	{
		this.endTime = endTime;
	}

}
