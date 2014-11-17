package com.ect.ws;

import java.io.File;
import java.io.InputStream;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.glassfish.jersey.process.internal.RequestScoped;
import org.springframework.beans.factory.annotation.Autowired;

import com.ect.service.MeetingRoomService;
import com.ect.util.AppUtils;
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
	@Path("/checkName")
	public Response checkName(@QueryParam("id") Integer mrId,
			@QueryParam("name") String name){
		String rtn = "{\"valid\":" + service.checkName(mrId, name) + "}";
		return Response.status(200).entity(rtn).build();
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
	
	
	@POST
	@Path("/position")
	@Produces({ "application/json;charset=UTF-8" })
	@Consumes({ "application/json;charset=UTF-8"})
	public MeetingRoomVO updateMeetingRoomLocation(MeetingRoomVO meetingRoom){
		MeetingRoomVO persitiedMrVo=service.getMeetingRoom(meetingRoom.getId());
		persitiedMrVo.setPosition(meetingRoom.getPosition());
		return service.saveOrUpdateMeetingRoom(persitiedMrVo);
	}
	
	
	
	@DELETE
	@Path("/{id}")
	public void deleteMeetingRoom(@PathParam("id") Integer id){
		service.deleteMeetingRoom(id);
	}
	
	@POST
	@Path("/image")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public Response uploadImage(
			@FormDataParam("mrId")String mrId,
			@FormDataParam("imageFile") InputStream fileInputStream,
			@FormDataParam("imageFile") FormDataContentDisposition contentDispositionHeader) {
		File folder=AppUtils.getImageFolder();
		System.out.println("mrId"+mrId);
		String savedName;
		if(mrId==null||mrId.trim().isEmpty()||"undefined".equalsIgnoreCase(mrId.trim())){
			savedName=System.currentTimeMillis()+contentDispositionHeader.getFileName().substring(contentDispositionHeader.getFileName().lastIndexOf("."));
		}else{
			savedName= mrId.trim();
		}
		File filePath = new File(folder,savedName);
		AppUtils.saveFile(fileInputStream, filePath);
		return Response.status(200).entity(savedName).build();
	}
}
