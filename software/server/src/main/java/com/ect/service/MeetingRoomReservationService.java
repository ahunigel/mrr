package com.ect.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.ReservationMeetingRoomDao;
import com.ect.domainobject.ITimeIntervalRecord;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.domainobject.ReservationType;
import com.ect.domainobject.User;
import com.ect.util.DateTimeUtil;
import com.ect.util.MeetingRoomUtil;
import com.ect.vo.MeetingRoomReservationVO;
import com.ect.vo.MeetingRoomStatusVO;
import com.ect.vo.MeetingRoomVO;

@Transactional
@Service
public class MeetingRoomReservationService
{

	private static final int NOT_CACHE_COUNT = 3;

	@Autowired
	private ReservationMeetingRoomDao reservationDao;

	public List<MeetingRoomReservationVO> getMeetingRoomReservationByDateRange(
			Date startDate, Date endDate)
	{
		List<ReservationTimeIntervalItemBean> items = reservationDao
				.getAllReservationItemsByDateRange(startDate, endDate);
		
		return MeetingRoomUtil.getMeetingRoomReservationVo(items);
	}
	
	public List<MeetingRoomStatusVO> getCurrentDateAvaliableMeetingRoom()
	{
		Date startDate = DateTimeUtil.getDateWithoutTime(new Date());
		Date endDate = DateTimeUtil.getAddedDaysDate(startDate, 1);
		Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> mrr = reservationDao
				.getMeetingRoomReservationByDateRange(startDate, endDate);
		List<MeetingRoomStatusVO> result = new ArrayList<MeetingRoomStatusVO>();
		Set<MeetingRoom> meetingRooms = mrr.keySet();
		MeetingRoomVO mrVo = null;
		MeetingRoomStatusVO  mrStatusVo = null;
		for (MeetingRoom mr : meetingRooms)
		{
			/*if (!MeetingRoomUtil.isMeetingRoomAvaliable(mrr.get(mr)))
			{
				continue;
			}*/
			mrStatusVo = new MeetingRoomStatusVO();
			mrVo = new MeetingRoomVO();
			BeanUtils.copyProperties(mr, mrVo);
			mrStatusVo.setMeetingRoom(mrVo);
			mrStatusVo.setItems(MeetingRoomUtil.getMeetingRoomReservationVo(mrr.get(mr)));
			result.add(mrStatusVo);
		}
		
		return result;
	} 

	public List<MeetingRoomReservationVO> getMeetingRoomReservationByUser(
			Integer userId)
	{
		List<MeetingRoomReservation> rem = reservationDao
				.getMeetingRoomReservationByUser(userId);

		return MeetingRoomUtil.convertMeetingRoomResult(rem);
	}

	public List<MeetingRoomReservationVO> getAllMeetingRoomReservation()
	{
		List<MeetingRoomReservation> rem = reservationDao.findAll();

		return MeetingRoomUtil.convertMeetingRoomResult(rem);
	}

	public List<MeetingRoomReservationVO> getReservationByMeetingRoom(Integer id)
	{
		List<MeetingRoomReservation> rem = reservationDao.findAll();
		return MeetingRoomUtil.convertMeetingRoomResult(rem);
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

	public boolean deleteOrCancelMeetingRoomReservation(Integer id)
	{
		reservationDao.deleteReservationTimeIntervalItems(id);
		return reservationDao.deleteMeetingRoomReservation(id);
	}
		
	public MeetingRoomReservationVO updateMeetingRoomReservation(
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

	private boolean isValidReservation(MeetingRoomReservation mrRes,
			List<ITimeIntervalRecord> reservationItems)
	{
		boolean isValid = true;
		int resCount = reservationDao
				.getReservationCountByMeetingRoom(mrRes.getMeetingRoom()
						.getId());
		List<ReservationTimeIntervalItemBean> result = null;
		if (resCount == 0)
		{
			return isValid;
		}

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
			
			reservationDao.deleteAllTempReservationItems();
		}
		return isValid;
	}

}
