package com.ect.vo;

import com.ect.domainobject.MeetingRoomStatus;

public class MeetingRoomVO {
	private Integer id;
	
	private String name;
	
	private String location;
	
	private int floor;
	
	private int seats;
	
	private MeetingRoomStatus status;
	
	private boolean projectorExist;
	
	private boolean phoneExist;
	

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
	
	

	public int getSeats() {
		return seats;
	}

	public void setSeats(int seats) {
		this.seats = seats;
	}

	public MeetingRoomStatus getStatus() {
		return status;
	}

	public void setStatus(MeetingRoomStatus status) {
		this.status = status;
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
	
	
}
