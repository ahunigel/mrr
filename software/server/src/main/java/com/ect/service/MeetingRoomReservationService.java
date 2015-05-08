package com.ect.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.MeetingRoomDao;
import com.ect.dao.ReservationMeetingRoomDao;
import com.ect.domainobject.ITimeIntervalRecord;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.MeetingRoomStatus;
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
	private static final int MEETING_ROOM_STATUS_AVALIABLE = 1;
	private static final int MEETING_ROOM_STATUS_OCCUPIED = 0;

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
	
	public List<MeetingRoomStatusVO> getCurrentDateMeetingRoom(Date selectedDate, boolean isOnlyAvaliable)
	{
		List<MeetingRoom> meetingRooms = dao.findAll();
		Date startDate = DateTimeUtil.getDateWithoutTime(selectedDate);
		Date endDate = DateTimeUtil.getAddedDaysDate(startDate, 1);
		Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> mrr = reservationDao
				.getMeetingRoomReservationByDateRange(startDate, endDate);
		List<MeetingRoomStatusVO> result = new ArrayList<MeetingRoomStatusVO>();
		MeetingRoomVO mrVo = null;
		MeetingRoomStatusVO  mrStatusVo = null;
		for (MeetingRoom mr : meetingRooms)
		{
			if (isOnlyAvaliable && !MeetingRoomUtil.isMeetingRoomAvaliable(mrr.get(mr), selectedDate))
			{
				continue;
			}
			if(!MeetingRoomUtil.isMeetingRoomAvaliable(mrr.get(mr), selectedDate))
			{
				mr.setStatus(MeetingRoomStatus.OCCUPIED);
			}
			else
			{
				mr.setStatus(MeetingRoomStatus.AVAILABLE);
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

	public List<MeetingRoomStatusVO> getMeetingRoomStatusByUserAndDateRange(Date startDate, Date endDate,
			Integer userId)
	{
		Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> rem = reservationDao
				.getMeetingRoomReservationByDateRangeAndUser(startDate, endDate, userId);
		Set<MeetingRoom> mrs = rem.keySet();
		List<MeetingRoomStatusVO> result = new ArrayList<MeetingRoomStatusVO>();
		MeetingRoomStatusVO mrStatusVo = null;
		MeetingRoomVO mrVo = null;
		for (MeetingRoom m : mrs)
		{
			mrStatusVo = new MeetingRoomStatusVO();
			mrVo = new MeetingRoomVO();
			BeanUtils.copyProperties(m, mrVo);
			mrStatusVo.setMeetingRoom(mrVo);
			mrStatusVo.setTimeIntervalItems(MeetingRoomUtil.convertReservationTimeIntervalItemForUI(rem.get(m)));
			mrStatusVo.setReservationItems(MeetingRoomUtil.getMeetingRoomReservationVo(rem.get(m), false));
			result.add(mrStatusVo);
		}

		Collections.sort(result, new Comparator<MeetingRoomStatusVO>(){
			@Override
			public int compare(MeetingRoomStatusVO o1, MeetingRoomStatusVO o2) {
				if(o1.getMeetingRoom().getFloor() != o2.getMeetingRoom().getFloor())
				{
					return (o1.getMeetingRoom().getFloor()>o2.getMeetingRoom().getFloor())? 1 : -1;
				}
				else
				{
					return o1.getMeetingRoom().getName().compareTo(o2.getMeetingRoom().getName());
				}
			}
		});
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
		if (reservationItems.size() == 0)
		{
			return mrr;
		}
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
	
	public boolean deleteReservationTimeIntervalItem(long itemId)
	{
		return reservationDao.deleteReservationTimeIntervalItems(itemId);
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
			reservationDao.updateMeetingRoomReservation(mr);
			if(reservationDao.deleteReservationTimeIntervalItemsByRes(mr.getId()))
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
			isValid = checkRecurrentReservation(reservationItems, mrRes);
		}

		return isValid;
	}

	private boolean checkRecurrentReservation(
			List<ITimeIntervalRecord> reservationItems, MeetingRoomReservation mrRes)
	{
		boolean isValid = true;
		List<ITimeIntervalRecord> result = null;
		ReservationTimeIntervalItemBean rt;
		if (reservationItems.size() < NOT_CACHE_COUNT)
		{
			for (int i = 0; i < reservationItems.size(); i++)
			{
				rt = (ReservationTimeIntervalItemBean) reservationItems.get(i);
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
