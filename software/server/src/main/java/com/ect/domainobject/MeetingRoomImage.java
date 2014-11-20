package com.ect.domainobject;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

@Entity
@Table(name = "meeting_room_img")
public class MeetingRoomImage {
	
	@Id
	@Column(name="meeting_room_id")
	@GeneratedValue(generator = "gen")
	@GenericGenerator(name = "gen", strategy = "foreign", parameters = @Parameter(name = "property", value = "meetRoom"))
	private Integer id;
	
	@Column(name="content", columnDefinition="longblob")
	private byte[] content;
	
	@OneToOne
	@PrimaryKeyJoinColumn
	private MeetingRoom meetRoom;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public byte[] getContent() {
		return content;
	}

	public void setContent(byte[] content) {
		this.content = content;
	}

	public MeetingRoom getMeetRoom() {
		return meetRoom;
	}

	public void setMeetRoom(MeetingRoom meetRoom) {
		this.meetRoom = meetRoom;
	}
	
	
}
