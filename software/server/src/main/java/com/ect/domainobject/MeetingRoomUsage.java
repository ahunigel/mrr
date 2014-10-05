package com.ect.domainobject;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "meeting_room_usage")
public class MeetingRoomUsage {
	
	private Integer id;	
	
	private MeetingRoom meetingRoom;
	
	private Date startTime;
	
	private Date endTime;
	
	private String meetingSubject;

	private User reservedPerson;

	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}
	@ManyToOne
	@JoinColumn(name = "meeting_room_id")
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
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	public String getMeetingSubject()
	{
		return meetingSubject;
	}

	public void setMeetingSubject(String meetingSubject)
	{
		this.meetingSubject = meetingSubject;
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

	@Override
	public String toString() {
		return "MeetingRoomUsage [id=" + id + ", meetingRoom=" + meetingRoom
				+ ", startTime=" + startTime + ", endTime=" + endTime + "]";
	}
	
	
	
	
}
