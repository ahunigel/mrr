package com.ect.ws;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
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
	
	@GET
	@Path("/{id}")
	@Produces({ "application/json;charset=UTF-8" })
	public MeetingRoomVO getMeetingRoom(@PathParam("id") Integer id){
		return service.getMeetingRoom(id);
	}
	
	@PUT
	@Produces({ "application/json;charset=UTF-8" })
	@Consumes({ "application/json;charset=UTF-8"})
	public MeetingRoomVO createMeetingRoom(MeetingRoomVO meetingRoom){
		return service.saveOrUpdateMeetingRoom(meetingRoom);
	}
	
	@POST
	@Produces({ "application/json;charset=UTF-8" })
	@Consumes({ "application/json;charset=UTF-8"})
	public MeetingRoomVO updateMeetingRoom(MeetingRoomVO meetingRoom){
		return service.saveOrUpdateMeetingRoom(meetingRoom);
	}
	
	
	@DELETE
	@Path("/{id}")
	public void deleteMeetingRoom(@PathParam("id") Integer id){
		service.deleteMeetingRoom(id);
	}
}
