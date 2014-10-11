package com.ect.domainobject;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@NamedQueries({
		@NamedQuery(name = "getReservationByRoom", query = "select m.meetingRoom from MeetingRoomReservation m where m.meetingRoom.id = :roomId"),
		@NamedQuery(name = "getReservationCountByRoom", query = "select count(m.id) from MeetingRoomReservation m where m.meetingRoom.id = :roomId and m.endTime >= :nowDate"),
		@NamedQuery(name = "getReservationGroupByMeetingRoom", query = "select m from MeetingRoomReservation m group by m.meetingRoom"),
		@NamedQuery(name = "getReservationByIdAndDateRange", query = "select m from MeetingRoomReservation m where (m.startTime >= :startTime"
				+ " or m.startTime < :endTime or m.endTime >= :endTime or m.endTime < :startTime) and m.meetingRoom.id = :roomId"),
		@NamedQuery(name = "getReservationByStartDate", query = "select m from MeetingRoomReservation m where m.startTime >= :startTime"),
		@NamedQuery(name = "getMeetingRoomReservationByUser", query = "select m from MeetingRoomReservation m where m.reservedPerson.id = :userId")

})
@Table(name = "meeting_room_reservation")
public class MeetingRoomReservation
{

	private Integer id;

	private ReservationType reservationType;

	/**
	 * reserver start time, if the reservation type is SINGLE, this field is
	 * date and time; if the reservation type is RECURRENT, this field is date;
	 * time use the field recurrentStartTime
	 */
	private Date startTime;

	/**
	 * reserver end time, if the reservation type is SINGLE, this field is date
	 * and time; if the reservation type is RECURRENT, this field is date; time
	 * use the field recurrentEndTime
	 */
	private Date endTime;

	/**
	 * description of the meeting.
	 */
	private String meetingSubject;

	private MeetingRoom meetingRoom;

	private User reservedPerson;

	/**
	 * following fields only valid when the reservation type is recurrent.
	 * 
	 */
	private RecurrentType recurrentType;

	/**
	 * if recurrent type is weekly the value should be 0-6 for Sunday to
	 * Saturday if recurrent type is monthly the value should from 1-31, day of
	 * month, -1 means last day of month. if recurrent type is yearly the value
	 * should from 1-366, day of year, -1 means last day of year.
	 */
	private Integer day;

	/**
	 * the interval for recurrent type,
	 * 
	 * if the value is 2 recurrent type is daily, then it means every two days
	 * recurrent type is weekly, then it means every two weeks recurrent type is
	 * yearly, then it means every two years.
	 */
	private Integer recurrentInterval = 1;

	// format Hour*60+Minute
	private Integer recurrentStartTime;
	// format Hour*60+Minute
	private Integer recurrentEndTime;

	private Set<ReservationTimeIntervalItemBean> getReservationItemsSet = null;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "meeting_room_reservation_id")
	public Integer getId()
	{
		return id;
	}

	public void setId(Integer id)
	{
		this.id = id;
	}

	public ReservationType getReservationType()
	{
		return reservationType;
	}

	public void setReservationType(ReservationType reservationType)
	{
		this.reservationType = reservationType;
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

	public RecurrentType getRecurrentType()
	{
		return recurrentType;
	}

	public void setRecurrentType(RecurrentType recurrentType)
	{
		this.recurrentType = recurrentType;
	}

	public Integer getRecurrentStartTime()
	{
		return recurrentStartTime;
	}

	public void setRecurrentStartTime(Integer recurrentStartTime)
	{
		this.recurrentStartTime = recurrentStartTime;
	}

	public Integer getRecurrentEndTime()
	{
		return recurrentEndTime;
	}

	public void setRecurrentEndTime(Integer recurrentEndTime)
	{
		this.recurrentEndTime = recurrentEndTime;
	}

	public String getMeetingSubject()
	{
		return meetingSubject;
	}

	public void setMeetingSubject(String meetingSubject)
	{
		this.meetingSubject = meetingSubject;
	}

	public Integer getDay()
	{
		return day;
	}

	public void setDay(Integer day)
	{
		this.day = day;
	}

	public Integer getRecurrentInterval()
	{
		return recurrentInterval;
	}

	public void setRecurrentInterval(Integer recurrentInterval)
	{
		this.recurrentInterval = recurrentInterval;
	}

	@ManyToOne
	@JoinColumn(name = "meeting_room_id")
	public MeetingRoom getMeetingRoom()
	{
		return meetingRoom;
	}

	public void setMeetingRoom(MeetingRoom meetingRoom)
	{
		this.meetingRoom = meetingRoom;
	}

	@ManyToOne
	@JoinColumn(name = "user_id")
	public User getReservedPerson()
	{
		return reservedPerson;
	}

	public void setReservedPerson(User reservedPerson)
	{
		this.reservedPerson = reservedPerson;
	}
	
	@OneToMany(cascade={CascadeType.ALL}, mappedBy="reservation")
	public Set<ReservationTimeIntervalItemBean> getGetReservationItemsSet()
	{
		if (getReservationItemsSet == null)
		{
			getReservationItemsSet = new HashSet<ReservationTimeIntervalItemBean>();
		}
		
		return getReservationItemsSet;
	}

	public void setGetReservationItemsSet(
			Set<ReservationTimeIntervalItemBean> getReservationItemsSet)
	{
		this.getReservationItemsSet = getReservationItemsSet;
	}

	@Override
	public String toString()
	{
		return "MeetingRoomReservation [id=" + id + ", reservationType="
				+ reservationType + ", startTime=" + startTime + ", endTime="
				+ endTime + ", meetingSubject=" + meetingSubject
				+ ", meetingRoom=" + meetingRoom + ", reservedPerson="
				+ reservedPerson + ", recurrentType=" + recurrentType
				+ ", day=" + day + ", recurrentInterval=" + recurrentInterval
				+ ", recurrentStartTime=" + recurrentStartTime
				+ ", recurrentEndTime=" + recurrentEndTime + "]";
	}

}
