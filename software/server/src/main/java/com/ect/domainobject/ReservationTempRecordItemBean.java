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
 * The temporary class for time interval items of meeting room reservation. Each
 * item is the single reservation of meeting room. This class is the cache data
 * to compare the current reservation with the reservation booked before and
 * check if there is conflict in the reservations. In order to speed up the
 * comparation, use database to process the comparation in two tables and get
 * the result.
 * 
 * @author Angel.Fu
 * 
 */
@Entity
@NamedQueries({
		@NamedQuery(name = "getMultipleItemsByTimeIntervalAndMeetingRoom", query = "select r1 from ReservationTimeIntervalItemBean r,ReservationTempRecordItemBean r1 where r.meetingRoom.id = r1.meetingRoom.id and r1.reservation.id != r.reservation.id and "
				+ "((r1.endTime > r.startTime and r1.endTime <= r.endTime) or (r1.startTime >= r.startTime and r1.startTime < r.endTime) or (r1.startTime >=r.startTime and r1.endTime <=r.endTime))")

})

@Table(name = "reservation_temp_item")
public class ReservationTempRecordItemBean implements ITimeIntervalRecord
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
