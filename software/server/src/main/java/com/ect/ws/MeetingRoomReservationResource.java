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

@RequestScoped
@Path("/meetingroomReservation")
public class MeetingRoomReservationResource {
	@Autowired
	private MeetingRoomReservationService service;
	
	@GET
	@Path("/reservation")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomReservationVO> getAllAvaliableMeetingRoomReservations()
	{
		return service.getAllMeetingRoomReservation();
	}
	
	@GET
	@Path("/reservation")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomReservationVO> getMeetingRoomReservationsByUser()
	{
		return service.getAllMeetingRoomReservation();
	}
	
	@GET
	@Path("/reservation")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomReservationVO> getAllMeetingRoomReservations()
	{
		return service.getAllMeetingRoomReservation();
	}
	
	@GET
	@Path("/{id}/reservation")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomReservationVO> getReservationsByMeetingRoom(@PathParam("id") Integer id)
	{
		return service.getReservationByMeetingRoom(id);
	}
	
	@PUT
	@Produces({ "application/json;charset=UTF-8" })
	@Consumes({ "application/json;charset=UTF-8"})
	@Path("/reservation")
	public MeetingRoomReservationVO createMeetingRoomReservation (MeetingRoomReservationVO mrr){
		return service.saveMeetingRoomReservation(mrr);
	}
	
	@POST
	@Produces({ "application/json;charset=UTF-8" })
	@Consumes({ "application/json;charset=UTF-8"})
	@Path("/reservation")
	public MeetingRoomReservationVO updateMeetingRoom(MeetingRoomReservationVO mrr){
		return service.updateMeetingRoomReservation(mrr);
	}
	
	@DELETE
	@Path("/{id}/reservation")
	public void deleteReservationByMeetingRoom(@PathParam("id") Integer id){
		service.deleteReservationByMeetingRoom(id);
	}
	
	@DELETE
	@Path("/reservation/{id}")
	public void deleteMeetingRoomReservation(@PathParam("id") Integer id){
		service.deleteMeetingRoomReservation(id);
	}
}
