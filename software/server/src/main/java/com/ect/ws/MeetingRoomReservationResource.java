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

import com.ect.service.MeetingRoomReservationService;
import com.ect.vo.MeetingRoomReservationVO;
import com.ect.vo.MeetingRoomStatusVO;

@RequestScoped
@Path("/meetingroomReservation")
public class MeetingRoomReservationResource {
	@Autowired
	private MeetingRoomReservationService service;
	
	@GET
	@Path("/reservation")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomStatusVO> getAllAvaliableMeetingRoomReservations()
	{
		return service.getCurrentDateMeetingRoom(true);
	}
	
	@GET
	@Path("/user/{id}")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomReservationVO> getMeetingRoomReservationsByUser(@PathParam("id") Integer id)
	{
		return service.getMeetingRoomReservationByUser(id);
	}
	
	@GET
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomStatusVO> getAllMeetingRoomReservations()
	{
		return service.getCurrentDateMeetingRoom(false);
	}
	
	@GET
	@Path("/meetingRoom/{id}")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomReservationVO> getReservationsByMeetingRoom(@PathParam("id") Integer id)
	{
		return service.getReservationByMeetingRoom(id);
	}
	
	@POST
	@Produces({ "application/json;charset=UTF-8" })
	@Consumes({ "application/json;charset=UTF-8" })
	@Path("/meetingroomStatus")
	public MeetingRoomStatusVO getReservationByDateRangeAndMrId (MeetingRoomStatusVO mrr){
		return service.getReservationByDateRangeAndMrId(mrr);
	}
	
	@PUT
	@Produces({ "application/json;charset=UTF-8" })
	@Consumes({ "application/json;charset=UTF-8" })
	@Path("/reservation")
	public MeetingRoomReservationVO createMeetingRoomReservation (MeetingRoomReservationVO mrr){
		return service.saveMeetingRoomReservation(mrr);
	}
	
	@POST
	@Produces({ "application/json;charset=UTF-8" })
	@Consumes({ "application/json;charset=UTF-8" })
	@Path("/reservation")
	public MeetingRoomReservationVO updateMeetingRoomReservation(MeetingRoomReservationVO mrr){
		return service.updateMeetingRoomReservation(mrr);
	}
	
	@DELETE
	@Produces({ "application/json;charset=UTF-8" })
	@Path("/meetingRoom/{id}")
	public boolean deleteReservationByMeetingRoom(@PathParam("id") Integer id){
		return service.deleteOrCancelMeetingRoomReservation(id);
	}

}
