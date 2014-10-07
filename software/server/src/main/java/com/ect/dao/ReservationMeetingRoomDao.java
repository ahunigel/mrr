package com.ect.dao;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.springframework.orm.hibernate4.HibernateCallback;
import org.springframework.stereotype.Component;

import com.ect.domainobject.ITimeIntervalRecord;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationTempRecordItemBean;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.util.MeetingRoomUtil;

@SuppressWarnings("rawtypes")
@Component
public class ReservationMeetingRoomDao extends BaseDao
{

	public List<MeetingRoomReservation> findAll()
	{
		return this.getHibernateTemplate()
				.loadAll(MeetingRoomReservation.class);
	}

	public void deleteReservationByMeetingRoom(Integer mId)
	{
		List<MeetingRoomReservation> mrrs = getReservationByMeetingRoom(mId);
		for (MeetingRoomReservation mrr : mrrs)
		{
			deleteReservationTimeIntervalItems(mrr.getId());
		}
		this.getHibernateTemplate().findByNamedQueryAndNamedParam(
				"deleteReservationByRoom", "roomId", mId);
	}

	@SuppressWarnings("unchecked")
	public List<MeetingRoomReservation> getReservationByMeetingRoom(Integer mId)
	{
		return (List<MeetingRoomReservation>) this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getReservationByRoom",
						"roomId", mId);
	}

	public int getReservationCountByMeetingRoom(Integer mId)
	{
		String[] params = new String[] { "roomId", "nowDate" };
		Object[] values = new Object[] { mId, new Date() };
		List result = this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getReservationCountByRoom",
						params, values);
		
		return ((Number)result.get(0)).intValue();
	}

	public MeetingRoomReservation saveMeetingRoomReservation(
			MeetingRoomReservation mrr)
	{
		this.getHibernateTemplate().saveOrUpdate(mrr);
		return mrr;
	}

	public boolean deleteMeetingRoomReservation(Integer mrrId)
	{
		if (deleteReservationTimeIntervalItems(mrrId))
		{
			this.getHibernateTemplate().findByNamedQueryAndNamedParam(
					"deleteReservationById", "mrrId", mrrId);
		}
		return true;
	}
		
	@SuppressWarnings("unchecked")
	public Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> getMeetingRoomReservationByDateRange(
			Date startDate, Date endDate)
	{
		String[] params = new String[] { "startTime", "endTime" };
		Object[] values = new Object[] { startDate, endDate };
		List<ReservationTimeIntervalItemBean> items = (List<ReservationTimeIntervalItemBean>) this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getItemsByTimeInterval", params,
						values);
		
		Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> mrr = MeetingRoomUtil.classifyRerservationItemsByMeetingRoom(items);
		
		return mrr;
	}
	
	@SuppressWarnings("unchecked")
	public List<ReservationTimeIntervalItemBean> getAllReservationItemsByDateRange(
			Date startDate, Date endDate)
	{
		String[] params = new String[] { "startTime", "endTime" };
		Object[] values = new Object[] { startDate, endDate };
		List<ReservationTimeIntervalItemBean> items = (List<ReservationTimeIntervalItemBean>) this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getItemsByTimeInterval", params,
						values);
		
		return items;
	}
	
	@SuppressWarnings("unchecked")
	public Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> getMeetingRoomReservationByDateRangeAndUser(
			Date startDate, Date endDate, Integer userId)
	{
		String[] params = new String[] { "startTime", "endTime", "userId" };
		Object[] values = new Object[] { startDate, endDate, userId };
		List<ReservationTimeIntervalItemBean> items = (List<ReservationTimeIntervalItemBean>) this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getItemsByTimeIntervalAndUser", params,
						values);
		
		Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> mrr = MeetingRoomUtil.classifyRerservationItemsByRerservation(items);
		
		return mrr;
	}

	
	@SuppressWarnings("unchecked")
	public List<MeetingRoomReservation> getMeetingRoomReservationBystartDate(
			Date datetime)
	{
		return (List<MeetingRoomReservation>) this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getReservationByStartDate", "startTime",
						datetime);
	}

	@SuppressWarnings("unchecked")
	public List<MeetingRoomReservation> getMeetingRoomReservationByUser(
			Integer userId)
	{
		return (List<MeetingRoomReservation>) this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getMeetingRoomReservationByUser", "userId",
						userId);
	}

	@SuppressWarnings("unchecked")
	public List<ReservationTimeIntervalItemBean> checkReservationDateRange(
			ReservationTimeIntervalItemBean rsItem)
	{
		Object[] values = new Object[] { rsItem.getStartTime(),
				rsItem.getEndTime(), rsItem.getMeetingRoom().getId() };
		String[] paramNames = new String[] { "startTime", "endTime", "mrId" };
		return (List<ReservationTimeIntervalItemBean>) this
				.getHibernateTemplate().findByNamedQueryAndNamedParam(
						"checkItemByTimeIntervalAndMeetingRoom", paramNames,
						values);
	}

	public boolean saveReservationTimeIntervalItems(
			final List<ITimeIntervalRecord> resItems, final boolean isTempRecord)
	{
		boolean isSucceed = this.getHibernateTemplate().execute(
				new HibernateCallback<Boolean>()
				{
					public Boolean doInHibernate(Session session)
							throws HibernateException
					{
						for (int i = 0; i < resItems.size(); i++)
						{
							if (isTempRecord)
							{
								ReservationTempRecordItemBean tempRt = (ReservationTempRecordItemBean) resItems
										.get(i);
								session.save(tempRt);
							}
							else
							{
								ReservationTimeIntervalItemBean tempRt = (ReservationTimeIntervalItemBean) resItems
										.get(i);
								session.save(tempRt);
							}

							if (i % 20 == 0)
							{
								session.flush();
								session.clear();
							}
						}

						return true;
					};
				});

		return isSucceed;
	}

	public boolean deleteReservationTimeIntervalItems(Integer mrrId)
	{
		this.getHibernateTemplate().findByNamedQueryAndNamedParam(
				"deleteItemsByReservation", "mrrId", mrrId);
		return true;
	}

	@SuppressWarnings("unchecked")
	public List<ReservationTimeIntervalItemBean> checkCachedReservationDateRange()
	{
		return (List<ReservationTimeIntervalItemBean>) this
				.getHibernateTemplate().findByNamedQuery(
						"getMultipleItemsByTimeIntervalAndMeetingRoom");
	}

	public void deleteAllTempReservationItems()
	{
		this.getHibernateTemplate().findByNamedQuery(
				"deleteAllTempReservationItems");
	}
}
