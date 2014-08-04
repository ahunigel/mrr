package com.ect;

import org.glassfish.jersey.server.ResourceConfig;


public class MeetingRoomApp extends ResourceConfig {
	public MeetingRoomApp(){
		packages("com.ect.ws");
//		register(JacksonJsonProvider.class);	
	}
}
