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
@Table(name = "meeting_room_reservation")
public class MeetingRoomReservation {
	
	private Integer id;
	
	private ReservationType reservationType;
	
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
	//format Hour*60+Minute
	private Integer recurrentStartTime;
	//format Hour*60+Minute
	private Integer recurrentEndTime;
	
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public ReservationType getReservationType() {
		return reservationType;
	}
	public void setReservationType(ReservationType reservationType) {
		this.reservationType = reservationType;
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
	public RecurrentType getRecurrentType() {
		return recurrentType;
	}
	public void setRecurrentType(RecurrentType recurrentType) {
		this.recurrentType = recurrentType;
	}
	public Integer getRecurrentStartTime() {
		return recurrentStartTime;
	}
	public void setRecurrentStartTime(Integer recurrentStartTime) {
		this.recurrentStartTime = recurrentStartTime;
	}
	public Integer getRecurrentEndTime() {
		return recurrentEndTime;
	}
	public void setRecurrentEndTime(Integer recurrentEndTime) {
		this.recurrentEndTime = recurrentEndTime;
	}	
	
	public String getMeetingSubject() {
		return meetingSubject;
	}
	public void setMeetingSubject(String meetingSubject) {
		this.meetingSubject = meetingSubject;
	}
	@ManyToOne
	@JoinColumn(name = "meeting_room_id")
	public MeetingRoom getMeetingRoom() {
		return meetingRoom;
	}
	public void setMeetingRoom(MeetingRoom meetingRoom) {
		this.meetingRoom = meetingRoom;
	}
	
	@ManyToOne
	@JoinColumn(name = "user_id")
	public User getReservedPerson() {
		return reservedPerson;
	}
	public void setReservedPerson(User reservedPerson) {
		this.reservedPerson = reservedPerson;
	}
	@Override
	public String toString() {
		return "MeetingRoomReservation [id=" + id + ", reservationType="
				+ reservationType + ", startTime=" + startTime + ", endTime="
				+ endTime + ", meetingSubject=" + meetingSubject
				+ ", meetingRoom=" + meetingRoom + ", reservedPerson="
				+ reservedPerson + ", recurrentType=" + recurrentType
				+ ", recurrentStartTime=" + recurrentStartTime
				+ ", recurrentEndTime=" + recurrentEndTime + "]";
	}
	
	
}
