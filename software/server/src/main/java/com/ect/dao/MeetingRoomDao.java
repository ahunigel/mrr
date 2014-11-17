package com.ect.dao;

import java.util.List;

import org.springframework.stereotype.Component;

import com.ect.domainobject.MeetingRoom;
@Component
public class MeetingRoomDao extends BaseDao<MeetingRoom>{
	
	public List<MeetingRoom> findAll(){
		return this.getHibernateTemplate().loadAll(MeetingRoom.class);
	}
	
	public MeetingRoom getMeetingRoomById(Integer mrId)
	{
		return (MeetingRoom) this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getMeetingRoomById",
						"mrId", mrId).get(0);
	}
	
	public boolean checkMeetingRoomName(Integer mrId, String mrName)
	{
		String[] argsName = {"mrId", "mrName"};
		Object[] values = {mrId, mrName};
		List all =  this.getHibernateTemplate().findByNamedQueryAndNamedParam("checkName",argsName, values);
		if(all!=null && all.size()>0)
		{
			return false;
		}
		return true;
	}
}
