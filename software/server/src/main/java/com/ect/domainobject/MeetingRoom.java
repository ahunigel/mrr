package com.ect.domainobject;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@NamedQueries({
	@NamedQuery(name = "getMeetingRoomById", query = "select m from MeetingRoom m where m.id = :mrId"),
	@NamedQuery(name = "checkName", query = "select m from MeetingRoom m where m.name = :mrName and m.id != :mrId"),
	@NamedQuery(name = "getMeetingRoomByImgName", query = "select m from MeetingRoom m where m.image = :imgName")
})
@Table(name = "meeting_room")
public class MeetingRoom {
	private Integer id;
	
	private String name;
	
	private String location;
	
	private String position;
	
	private int floor;
	private int seats;
	
	private MeetingRoomStatus status;
	
	private boolean projectorExist;
	
	private boolean phoneExist;
	
	private String image;
	
	private boolean specailRoom;
	
	public MeetingRoom(){
		
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "meeting_room_id")
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public int getFloor() {
		return floor;
	}

	public void setFloor(int floor) {
		this.floor = floor;
	}

	public MeetingRoomStatus getStatus() {
		return status;
	}

	public void setStatus(MeetingRoomStatus status) {
		this.status = status;
	}	
	

	public int getSeats() {
		return seats;
	}

	public void setSeats(int seats) {
		this.seats = seats;
	}

	public boolean isProjectorExist() {
		return projectorExist;
	}

	public void setProjectorExist(boolean projectorExist) {
		this.projectorExist = projectorExist;
	}

	public boolean isPhoneExist() {
		return phoneExist;
	}

	public void setPhoneExist(boolean phoneExist) {
		this.phoneExist = phoneExist;
	}

	
	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public boolean isSpecailRoom() {
		return specailRoom;
	}

	public void setSpecailRoom(boolean specailRoom) {
		this.specailRoom = specailRoom;
	}

	
	
	/**
	 * @return the position
	 */
	public String getPosition() {
		return position;
	}

	/**
	 * @param position the position to set
	 */
	public void setPosition(String position) {
		this.position = position;
	}
	
	private MeetingRoomImage meetingRoomImg;
	
	@OneToOne(mappedBy="meetRoom", cascade = CascadeType.ALL)
	public MeetingRoomImage getMeetingRoomImg() {
		return meetingRoomImg;
	}

	public void setMeetingRoomImg(MeetingRoomImage meetingRoomImg) {
		this.meetingRoomImg = meetingRoomImg;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "MeetingRoom [id=" + id + ", name=" + name + ", location="
				+ location + ", floor=" + floor + ", seats=" + seats
				+ ", status=" + status + ", projectorExist=" + projectorExist
				+ ", phoneExist=" + phoneExist + ", image=" + image
				+ ", specailRoom=" + specailRoom + "]";
	}



	
	
}
