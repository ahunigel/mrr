package com.ect;

import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;


public class MeetingRoomApp extends ResourceConfig {
	public MeetingRoomApp(){
		packages("com.ect.ws");		
		register(MultiPartFeature.class);
//		register(JacksonJsonProvider.class);	
	}
}
