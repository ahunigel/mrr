package com.ect.dao;

import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Component;

import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.domainobject.User;
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

	public List<MeetingRoomReservation> findByDate(Date datetime) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<MeetingRoomReservation> findByUser(User user) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@SuppressWarnings("unchecked")
	public List<MeetingRoomReservation> checkReservationDateRange(MeetingRoomReservation mrRes) {
		
		Integer rmId = mrRes.getMeetingRoom().getId();
		Integer startTime = mrRes.getRecurrentStartTime();
		Integer endTime = mrRes.getRecurrentEndTime();
		List<MeetingRoomReservation> result = null;
		String[] paramNames = new String[]{"startTime","endTime","roomId"};
		Object[] values = new Object[]{startTime, endTime, rmId};
		result = (List<MeetingRoomReservation>)this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getReservationByIdAndDateRange", paramNames, values);
		
		return result;
	}
	
	public List<ReservationTimeIntervalItemBean> checkReservationDateRange(ReservationTimeIntervalItemBean reservationItem)
	{
		return null;
	}
	
	public boolean saveReservationTimeIntervalItems (List<ReservationTimeIntervalItemBean> resItems, boolean isTempRecord)
	{
		return false;
	}
	
	public boolean removeReservationTimeIntervalItems(MeetingRoomReservation mrr)
	{
		return true;
	}
	
	public List<ReservationTimeIntervalItemBean> checkCachedReservationDateRange()
	{
		return null;
	}
}
