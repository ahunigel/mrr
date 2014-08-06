package com.ect.domainobject;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;


@Entity
@Table(name = "sensor")
public class Sensor {
	
	private Integer id;
	
	private MeetingRoom location;
	
	private String uniqueId;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}
	@OneToOne
	@JoinColumn(name = "meeting_room_id")
	public MeetingRoom getLocation() {
		return location;
	}

	
	public void setLocation(MeetingRoom location) {
		this.location = location;
	}

	public String getUniqueId() {
		return uniqueId;
	}

	public void setUniqueId(String uniqueId) {
		this.uniqueId = uniqueId;
	}

	@Override
	public String toString() {
		return "Sensor [id=" + id + ", location=" + location + ", uniqueId="
				+ uniqueId + "]";
	}
	
	

}
