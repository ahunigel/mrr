package com.ect.ws;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.glassfish.jersey.process.internal.RequestScoped;
import org.springframework.beans.factory.annotation.Autowired;

import com.ect.service.MeetingRoomService;
import com.ect.vo.MeetingRoomVO;

@RequestScoped
@Path("/meetingrooms")
public class MeetingRoomResource {
	@Autowired
	private MeetingRoomService service;
	
	@GET
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomVO> getAllMeetingRooms(){
		return service.getAllMeetingRoom();
	}
	
}
