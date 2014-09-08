package com.ect.ws;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import org.glassfish.jersey.process.internal.RequestScoped;
import org.springframework.beans.factory.annotation.Autowired;

import com.ect.service.UserService;
import com.ect.vo.UserVO;

@RequestScoped
@Path("/users")
public class UserResource {

	@Autowired
	private UserService service;
	
	@GET
	@Produces({ "application/json;charset=UTF-8" })
	public UserVO getUserByEmail(@QueryParam("email")String email){
		return service.getUserByEmail(email);
	}
	
	@GET
	@Produces({ "application/json;charset=UTF-8" })
	@Path("/{id}")
	public UserVO getUserById(@PathParam("id")Integer id){
		return service.getUserById(id);
	}
	
	@GET
	@Produces({ "application/json;charset=UTF-8" })
	public UserVO getUserByNameAndPwd(@QueryParam("userName")String userName,@QueryParam("password")String password)
	{
		return service.authenticate(userName,password);
	}
}
