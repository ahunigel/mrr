package com.ect.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.MeetingRoomDao;
import com.ect.dao.ReservationMeetingRoomDao;
import com.ect.domainobject.ITimeIntervalRecord;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.domainobject.ReservationType;
import com.ect.domainobject.User;
import com.ect.util.DateTimeUtil;
import com.ect.vo.MeetingRoomReservationVO;
import com.ect.vo.MeetingRoomVO;

@Transactional
@Service
public class MeetingRoomService
{

	private static final int NOT_CACHE_COUNT = 3;
	@Autowired
	private MeetingRoomDao dao;
	@Autowired
	private ReservationMeetingRoomDao reservationDao;

	public List<MeetingRoomVO> getAllMeetingRoom()
	{
		List<MeetingRoom> mrList = dao.findAll();

		List<MeetingRoomVO> result = new ArrayList<MeetingRoomVO>();
		for (MeetingRoom mr : mrList)
		{
			MeetingRoomVO vo = new MeetingRoomVO();
			BeanUtils.copyProperties(mr, vo);
			result.add(vo);
		}
		return result;

	}

	public MeetingRoomVO getMeetingRoom(Integer id)
	{
		MeetingRoom meetingRoom = new MeetingRoom();
		dao.get(meetingRoom, id);
		MeetingRoomVO vo = new MeetingRoomVO();
		BeanUtils.copyProperties(meetingRoom, vo);
		return vo;
	}

	public void deleteMeetingRoom(Integer id)
	{
		MeetingRoom mr = new MeetingRoom();
		mr.setId(id);
		dao.delete(mr);
	}

	public MeetingRoomVO saveOrUpdateMeetingRoom(MeetingRoomVO meetingRoom)
	{
		MeetingRoom mr = new MeetingRoom();
		BeanUtils.copyProperties(meetingRoom, mr);
		dao.saveOrUpdate(mr);
		meetingRoom.setId(mr.getId());
		return meetingRoom;
	}

	public List<MeetingRoomReservationVO> getMeetingRoomReservationBystartDate(
			Date datetime)
	{
		List<MeetingRoomReservation> rem = reservationDao
				.getMeetingRoomReservationBystartDate(datetime);
		return convertMeetingRoomResult(rem);
	}

	public List<MeetingRoomReservationVO> getMeetingRoomReservationByUser(
			User user)
	{
		List<MeetingRoomReservation> rem = reservationDao
				.getMeetingRoomReservationByUser(user);

		return convertMeetingRoomResult(rem);
	}

	private List<MeetingRoomReservationVO> convertMeetingRoomResult(
			List<MeetingRoomReservation> rem)
	{
		List<MeetingRoomReservationVO> result = new ArrayList<MeetingRoomReservationVO>();
		for (MeetingRoomReservation mr : rem)
		{
			MeetingRoomReservationVO vo = new MeetingRoomReservationVO();
			BeanUtils.copyProperties(mr, vo);
			result.add(vo);
		}
		return result;
	}

	public List<MeetingRoomReservationVO> getAllMeetingRoomReservation()
	{
		List<MeetingRoomReservation> rem = reservationDao.findAll();

		return convertMeetingRoomResult(rem);
	}

	public List<MeetingRoomReservationVO> getReservationByMeetingRoom(Integer id)
	{
		List<MeetingRoomReservation> rem = reservationDao.findAll();
		return convertMeetingRoomResult(rem);
	}

	public MeetingRoomReservationVO saveMeetingRoomReservation(
			MeetingRoomReservationVO mrr)
	{
		MeetingRoomReservation mr = new MeetingRoomReservation();
		BeanUtils.copyProperties(mrr, mr);
		List<ITimeIntervalRecord> reservationItems = DateTimeUtil
				.getReservationTimeIntervalRecords(mr);
		if (isValidReservation(mr, reservationItems))
		{
			mr = reservationDao.saveMeetingRoomReservation(mr);
			reservationDao.saveReservationTimeIntervalItems(reservationItems,
					false);
			mrr.setId(mr.getId());
		}
		return mrr;
	}

	public MeetingRoomReservationVO updateMeetingRoomReservation(
			MeetingRoomReservationVO mrr)
	{
		MeetingRoomReservation mr = new MeetingRoomReservation();
		BeanUtils.copyProperties(mrr, mr);
		mr.setCanceled(true);
		mr = reservationDao.saveMeetingRoomReservation(mr);
		reservationDao.deleteReservationTimeIntervalItems(mr.getId());
		return mrr;
	}
	
	public boolean deleteMeetingRoomReservation(Integer id)
	{

		return reservationDao.deleteMeetingRoomReservation(id);
	}
	
	public MeetingRoomReservationVO cancelMeetingRoomReservation(
			MeetingRoomReservationVO mrr)
	{
		MeetingRoomReservation mr = new MeetingRoomReservation();
		BeanUtils.copyProperties(mrr, mr);
		List<ITimeIntervalRecord> reservationItems = DateTimeUtil
				.getReservationTimeIntervalRecords(mr);
		if (isValidReservation(mr, reservationItems))
		{
			if(reservationDao.deleteReservationTimeIntervalItems(mr.getId()))
			{
				reservationDao.saveReservationTimeIntervalItems(reservationItems,
						false);
			}
			mrr.setId(mr.getId());
		}
		return mrr;
	}


	public void deleteReservationByMeetingRoom(Integer id)
	{
		reservationDao.deleteReservationByMeetingRoom(id);
	}

	private boolean isValidReservation(MeetingRoomReservation mrRes,
			List<ITimeIntervalRecord> reservationItems)
	{
		boolean isValid = true;
		int resCount = reservationDao
				.getActiveReservationCountByMeetingRoom(mrRes.getMeetingRoom()
						.getId());
		List<ReservationTimeIntervalItemBean> result = null;
		if (resCount == 0)
		{
			return isValid;
		}

		reservationItems = DateTimeUtil
				.getReservationTimeIntervalRecords(mrRes);
		ReservationTimeIntervalItemBean rt;
		if (mrRes.getReservationType().equals(ReservationType.SINGLE))
		{
			rt = (ReservationTimeIntervalItemBean) reservationItems.get(0);
			result = reservationDao.checkReservationDateRange(rt);
			if (result != null && result.size() > 0)
			{
				isValid = false;
			}

		}
		else if (mrRes.getReservationType().equals(ReservationType.RECURRENT))
		{
			isValid = checkRecurrentReservation(reservationItems);
		}

		return isValid;
	}

	private boolean checkRecurrentReservation(
			List<ITimeIntervalRecord> reservationItems)
	{
		boolean isValid = true;
		List<ReservationTimeIntervalItemBean> result = null;
		ReservationTimeIntervalItemBean rt;
		if (reservationItems.size() < NOT_CACHE_COUNT)
		{
			for (int i = 0; i < reservationItems.size(); i++)
			{
				rt = (ReservationTimeIntervalItemBean) reservationItems.get(0);
				result = reservationDao.checkReservationDateRange(rt);
				if (result != null && result.size() > 0)
				{
					isValid = false;
					break;
				}
			}
		}
		else
		{
			boolean isFinished = reservationDao
					.saveReservationTimeIntervalItems(reservationItems, true);
			if (isFinished)
			{
				result = reservationDao.checkCachedReservationDateRange();
			}

			if (result != null && result.size() > 0)
			{
				isValid = false;
			}
		}
		return isValid;
	}

}
