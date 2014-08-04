package com.ect.dao;

import java.util.List;

import org.springframework.stereotype.Component;

import com.ect.domainobject.MeetingRoom;
@Component
public class MeetingRoomDao extends BaseDao<MeetingRoom>{
	
	public List<MeetingRoom> findAll(){
		return this.getHibernateTemplate().loadAll(MeetingRoom.class);
	}
	
}
