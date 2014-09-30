package com.ect.dao;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.springframework.orm.hibernate4.HibernateCallback;
import org.springframework.stereotype.Component;

import com.ect.domainobject.ITimeIntervalRecord;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationTempRecordItemBean;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.domainobject.User;

@Component
public class ReservationMeetingRoomDao extends BaseDao<MeetingRoomReservation>
{

	public List<MeetingRoomReservation> findAll()
	{
		return this.getHibernateTemplate()
				.loadAll(MeetingRoomReservation.class);
	}

	public void deleteReservationByMeetingRoom(long mId)
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
	public List<MeetingRoomReservation> getReservationByMeetingRoom(long mId)
	{
		return (List<MeetingRoomReservation>) this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getReservationByRoom",
						"roomId", mId);
	}

	public int getActiveReservationCountByMeetingRoom(long mId)
	{
		String[] params = new String[] { "roomId", "nowDate" };
		Object[] values = new Object[] { mId, new Date() };
		@SuppressWarnings("rawtypes")
		List result = this.getHibernateTemplate()
				.findByNamedQueryAndNamedParam("getReservationCountByRoom",
						params, values);
		return (Integer) result.get(0);
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
			this.getHibernateTemplate().findByNamedParam(
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
				.findByNamedParam("getItemsByTimeInterval", params,
						values);
		
		Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> mrr = classifyRerservationItemsByMeetingRoom(items);
		
		return mrr;
	}
	
	@SuppressWarnings("unchecked")
	public Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> getMeetingRoomReservationByDateRangeAndUser(
			Date startDate, Date endDate, Integer userId)
	{
		String[] params = new String[] { "startTime", "endTime", "userId" };
		Object[] values = new Object[] { startDate, endDate, userId };
		List<ReservationTimeIntervalItemBean> items = (List<ReservationTimeIntervalItemBean>) this.getHibernateTemplate()
				.findByNamedParam("getItemsByTimeIntervalAndUser", params,
						values);
		
		Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> mrr = classifyRerservationItemsByRerservation(items);
		
		return mrr;
	}

	private Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> classifyRerservationItemsByMeetingRoom(
			List<ReservationTimeIntervalItemBean> items)
	{
		Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> mrr = new HashMap<MeetingRoom, List<ReservationTimeIntervalItemBean>>();
		for (ReservationTimeIntervalItemBean item : items)
		{
			if (mrr.containsKey(item.getReservation()))
			{
				mrr.get(item.getMeetingRoom()).add(item);
			}
			else
			{
				List<ReservationTimeIntervalItemBean> resItems = new ArrayList<ReservationTimeIntervalItemBean>();
				resItems.add(item);
				mrr.put(item.getMeetingRoom(), resItems);
			}
			
		}
		return mrr;
	}
	
	private Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> classifyRerservationItemsByRerservation(
			List<ReservationTimeIntervalItemBean> items)
	{
		Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> mrr = new HashMap<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>>();
		for (ReservationTimeIntervalItemBean item : items)
		{
			if (mrr.containsKey(item.getReservation()))
			{
				mrr.get(item.getReservation()).add(item);
			}
			else
			{
				List<ReservationTimeIntervalItemBean> resItems = new ArrayList<ReservationTimeIntervalItemBean>();
				resItems.add(item);
				mrr.put(item.getReservation(), resItems);
			}
			
		}
		return mrr;
	}

	
	@SuppressWarnings("unchecked")
	public List<MeetingRoomReservation> getMeetingRoomReservationBystartDate(
			Date datetime)
	{
		return (List<MeetingRoomReservation>) this.getHibernateTemplate()
				.findByNamedParam("getReservationByStartDate", "startTime",
						datetime);
	}

	@SuppressWarnings("unchecked")
	public List<MeetingRoomReservation> getMeetingRoomReservationByUser(
			User user)
	{
		return (List<MeetingRoomReservation>) this.getHibernateTemplate()
				.findByNamedParam("getMeetingRoomReservationByUser", "userId",
						user.getId());
	}

	@SuppressWarnings("unchecked")
	public List<ReservationTimeIntervalItemBean> checkReservationDateRange(
			ReservationTimeIntervalItemBean rsItem)
	{
		Object[] values = new Object[] { rsItem.getStartTime(),
				rsItem.getEndTime(), rsItem.getMeetingRoom().getId() };
		String[] paramNames = new String[] { "startTime", "endTime", "mrId" };
		return (List<ReservationTimeIntervalItemBean>) this
				.getHibernateTemplate().findByNamedParam(
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
						Transaction ts = session.beginTransaction();
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

						ts.commit();
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
