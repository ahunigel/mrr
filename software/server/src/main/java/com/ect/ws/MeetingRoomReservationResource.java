package com.ect.ws;

import java.util.Date;
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
import com.ect.util.DateTimeUtil;
import com.ect.vo.MeetingRoomReservationVO;
import com.ect.vo.MeetingRoomStatusVO;

@RequestScoped
@Path("/meetingroomReservation")
public class MeetingRoomReservationResource {
	@Autowired
	private MeetingRoomReservationService service;
	
	@GET
	@Path("/reservation/{date}")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomStatusVO> getAllAvaliableMeetingRoomReservations(@PathParam("date") long selectedDate)
	{
		return service.getCurrentDateMeetingRoom(new Date(selectedDate), true);
	}
	
	@GET
	@Path("/user/{id}")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomStatusVO> getMeetingRoomReservationsByUser(@PathParam("id") Integer id)
	{
		Date startDate = DateTimeUtil.getDateWithoutTime(new Date());
		Date endDate = DateTimeUtil.getAddedMonthDate(startDate, 1);
		return service.getMeetingRoomStatusByUserAndDateRange(startDate,endDate,id);
	}
	
	@GET
	@Path("/{date}")
	@Produces({ "application/json;charset=UTF-8" })
	public List<MeetingRoomStatusVO> getAllMeetingRoomReservations(@PathParam("date") long selectedDate)
	{
		return service.getCurrentDateMeetingRoom(new Date(selectedDate), false);
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
