package com.ect.dao;

import java.util.List;

import org.springframework.stereotype.Component;

import com.ect.domainobject.MeetingRoomReservation;
@Component
public class ReservationMeetingRoomDao extends BaseDao<MeetingRoomReservation>{
	
	public List<MeetingRoomReservation> findAll(){
		return this.getHibernateTemplate().loadAll(MeetingRoomReservation.class);
	}
	
	public void deleteReservationByMeetingRoom(long mId)
	{
		this.getHibernateTemplate().findByNamedQueryAndNamedParam("deleteReservationByRoom", "roomId", mId);
	}
	
	@SuppressWarnings("unchecked")
	public List<MeetingRoomReservation> getReservationByMeetingRoom(long mId)
	{
		return (List<MeetingRoomReservation>) this.getHibernateTemplate().findByNamedQueryAndNamedParam("getReservationByRoom", "roomId", mId);
	}
}
