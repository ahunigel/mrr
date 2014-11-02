package com.ect.vo;

import java.io.Serializable;

import com.ect.domainobject.MeetingRoomStatus;

public class MeetingRoomVO implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private Integer id;
	
	private String name;
	
	private String location;
	
	private int floor;
	
	private int seats;
	
	private MeetingRoomStatus status;
	
	private boolean projectorExist;
	
	private boolean phoneExist;
	
	private String image;
	
	private boolean specailRoom;
	
	private String position;

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

	/**
	 * @return the image
	 */
	public String getImage() {
		return image;
	}

	/**
	 * @param image the image to set
	 */
	public void setImage(String image) {
		this.image = image;
	}

	/**
	 * @return the specailRoom
	 */
	public boolean isSpecailRoom() {
		return specailRoom;
	}

	/**
	 * @param specailRoom the specailRoom to set
	 */
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
	
	
}
