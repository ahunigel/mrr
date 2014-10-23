package com.ect.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.MeetingRoomDao;
import com.ect.dao.ReservationMeetingRoomDao;
import com.ect.domainobject.ITimeIntervalRecord;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationTempRecordItemBean;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.domainobject.ReservationType;
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
	@Autowired
	private MeetingRoomDao dao;

	public List<MeetingRoomReservationVO> getMeetingRoomReservationByDateRange(
			Date startDate, Date endDate)
	{
		List<ReservationTimeIntervalItemBean> items = reservationDao
				.getAllReservationItemsByDateRange(startDate, endDate);
		
		return MeetingRoomUtil.getMeetingRoomReservationVo(items, true);
	}
	
	public List<MeetingRoomStatusVO> getCurrentDateMeetingRoom(boolean isOnlyAvaliable)
	{
		List<MeetingRoom> meetingRooms = dao.findAll();
		Date startDate = DateTimeUtil.getDateWithoutTime(new Date());
		Date endDate = DateTimeUtil.getAddedDaysDate(startDate, 1);
		Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> mrr = reservationDao
				.getMeetingRoomReservationByDateRange(startDate, endDate);
		List<MeetingRoomStatusVO> result = new ArrayList<MeetingRoomStatusVO>();
		MeetingRoomVO mrVo = null;
		MeetingRoomStatusVO  mrStatusVo = null;
		for (MeetingRoom mr : meetingRooms)
		{
			if (isOnlyAvaliable && !MeetingRoomUtil.isMeetingRoomAvaliable(mrr.get(mr)))
			{
				continue;
			}
			mrStatusVo = new MeetingRoomStatusVO();
			mrVo = new MeetingRoomVO();
			BeanUtils.copyProperties(mr, mrVo);
			mrStatusVo.setMeetingRoom(mrVo);
			mrStatusVo.setTimeIntervalItems(MeetingRoomUtil.convertReservationTimeIntervalItemForUI(mrr.get(mr)));
			mrStatusVo.setReservationItems(MeetingRoomUtil.getMeetingRoomReservationVo(mrr.get(mr), false));
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
	
	public MeetingRoomStatusVO getReservationByDateRangeAndMrId(MeetingRoomStatusVO mrr)
	{
		List<ReservationTimeIntervalItemBean> result = reservationDao.getReservationByDateRangeAndMrId(mrr.getStartTime(), mrr.getEndTime(), mrr.getId());
		MeetingRoomStatusVO mrStatusVo = new MeetingRoomStatusVO();
		mrStatusVo.setStartTime(mrr.getStartTime());
		mrStatusVo.setEndTime(mrr.getEndTime());
		if (result != null && result.size() > 0)
		{
			ReservationTimeIntervalItemBean item = result.get(0);
			MeetingRoomVO mrVo = new MeetingRoomVO();
			BeanUtils.copyProperties(item.getMeetingRoom(), mrVo);
			mrStatusVo.setTimeIntervalItems(MeetingRoomUtil.convertReservationTimeIntervalItemForUI(result));
			mrStatusVo.setMeetingRoom(mrVo);
		}
		
		return mrStatusVo;
	}

	public List<MeetingRoomReservationVO> getAllMeetingRoomReservation()
	{
		List<MeetingRoomReservation> rem = reservationDao.getAllMeetingRoomReservation();

		return MeetingRoomUtil.convertMeetingRoomResult(rem);
	}

	public List<MeetingRoomReservationVO> getReservationByMeetingRoom(Integer id)
	{
		List<MeetingRoomReservation> rem = reservationDao.getReservationByMeetingRoom(id);
		return MeetingRoomUtil.convertMeetingRoomResult(rem);
	}

	public MeetingRoomReservationVO saveMeetingRoomReservation(
			MeetingRoomReservationVO mrr)
	{
		MeetingRoomReservation mr = new MeetingRoomReservation();
		MeetingRoom mrt = new MeetingRoom();
		BeanUtils.copyProperties(mrr, mr);
		BeanUtils.copyProperties(mrr.getMeetingRoom(), mrt);
		mr.setMeetingRoom(mrt);
		List<ITimeIntervalRecord> reservationItems = DateTimeUtil
				.getReservationTimeIntervalRecords(mr);
		mr = reservationDao.saveMeetingRoomReservation(mr);
		if (isValidReservation(mr, reservationItems))
		{
			reservationDao.saveReservationTimeIntervalItems(reservationItems,
					false);
			mrt = dao.getMeetingRoomById(mrt.getId());
			MeetingRoomVO mrVo = new MeetingRoomVO();
			BeanUtils.copyProperties(mrt, mrVo);
			mrr.setMeetingRoom(mrVo);
			mrr.setId(mr.getId());
		}
		else
		{
			reservationDao.deleteMeetingRoomReservation(mr.getId());
		}
		
		return mrr;
	}

	public boolean deleteOrCancelMeetingRoomReservation(Integer id)
	{
		return reservationDao.deleteMeetingRoomReservation(id);
	}
		
	public MeetingRoomReservationVO updateMeetingRoomReservation(
			MeetingRoomReservationVO mrr)
	{
		MeetingRoomReservation mr = new MeetingRoomReservation();
		MeetingRoom mrt = new MeetingRoom();
		BeanUtils.copyProperties(mrr, mr);
		BeanUtils.copyProperties(mrr.getMeetingRoom(), mrt);
		mr.setMeetingRoom(mrt);
		List<ITimeIntervalRecord> reservationItems = DateTimeUtil
				.getReservationTimeIntervalRecords(mr);
		if (isValidReservation(mr, reservationItems))
		{
			reservationDao.saveMeetingRoomReservation(mr);
			if(reservationDao.deleteReservationTimeIntervalItems(mr.getId()))
			{
				reservationDao.saveReservationTimeIntervalItems(reservationItems,
						false);
			}
			
			mrt = dao.getMeetingRoomById(mrt.getId());
			MeetingRoomVO mrVo = new MeetingRoomVO();
			BeanUtils.copyProperties(mrt, mrVo);
			mrr.setMeetingRoom(mrVo);
		}
		else
		{
			mrr.setId(null);
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
		List<ITimeIntervalRecord> result = null;
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
		List<ITimeIntervalRecord> result = null;
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
			List<ITimeIntervalRecord> tempItems = new ArrayList<ITimeIntervalRecord>();
			ReservationTempRecordItemBean tempItem = null;
			for (ITimeIntervalRecord item : reservationItems)
			{
				item = (ReservationTimeIntervalItemBean)item;
				tempItem = new ReservationTempRecordItemBean();
				BeanUtils.copyProperties(item, tempItem);
				tempItems.add(tempItem);
				
			}
			boolean isFinished = reservationDao
					.saveReservationTimeIntervalItems(tempItems, true);
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
