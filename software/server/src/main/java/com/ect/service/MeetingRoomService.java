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
public class MeetingRoomService {
	
	private static final int NOT_CACHE_COUNT = 3;
	@Autowired
	private MeetingRoomDao dao;
	@Autowired
	private ReservationMeetingRoomDao reservationDao;
	
	public List<MeetingRoomVO> getAllMeetingRoom(){
		List<MeetingRoom>mrList=dao.findAll();
		
		List<MeetingRoomVO> result=new ArrayList<MeetingRoomVO>();
		for(MeetingRoom mr:mrList){
			MeetingRoomVO vo=new MeetingRoomVO();
			BeanUtils.copyProperties(mr, vo);
			result.add(vo);
		}
		return result;
		
	}
	
	public MeetingRoomVO getMeetingRoom(Integer id){
		MeetingRoom meetingRoom=new MeetingRoom();
		dao.get(meetingRoom, id);
		MeetingRoomVO vo=new MeetingRoomVO();
		BeanUtils.copyProperties(meetingRoom, vo);
		return vo;
	}
	
	public void deleteMeetingRoom(Integer id){
		MeetingRoom mr=new MeetingRoom();
		mr.setId(id);
		dao.delete(mr);
	}

	public MeetingRoomVO saveOrUpdateMeetingRoom(MeetingRoomVO meetingRoom) {
		MeetingRoom mr=new MeetingRoom();
		BeanUtils.copyProperties(meetingRoom, mr);
		dao.saveOrUpdate(mr);
		meetingRoom.setId(mr.getId());
		return meetingRoom;
	}
	
	public List<MeetingRoomReservationVO> getMeetingRoomReservationByDate(Date datetime){
		List<MeetingRoomReservation> rem = reservationDao.findByDate(datetime);
		return convertMeetingRoomResult(rem);
	}
	
	
	public List<MeetingRoomReservationVO> getMeetingRoomReservationByUser(User user){
		List<MeetingRoomReservation> rem = reservationDao.findByUser(user);

		return convertMeetingRoomResult(rem);
	}

	private List<MeetingRoomReservationVO> convertMeetingRoomResult(
			List<MeetingRoomReservation> rem) {
		List<MeetingRoomReservationVO> result=new ArrayList<MeetingRoomReservationVO>();
		for(MeetingRoomReservation mr:rem){
			MeetingRoomReservationVO vo=new MeetingRoomReservationVO();
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
	
	public MeetingRoomReservationVO saveOrUpdateMeetingRoomReservation(MeetingRoomReservationVO mrr) {
		MeetingRoomReservation mr=new MeetingRoomReservation();
		BeanUtils.copyProperties(mrr, mr);
		if (isValidReservation(mr))
		{
			mrr.setId(mr.getId());
		}
		return mrr;
	}
	
	public void deleteMeetingRoomReservation(Integer id)
	{
		MeetingRoomReservation mr=new MeetingRoomReservation();
		mr.setId(id);
		reservationDao.delete(mr);
	}
		
	public void deleteReservationByMeetingRoom(Integer id)
	{
		reservationDao.deleteReservationByMeetingRoom(id);
	}
	
	
	public boolean isValidReservation(MeetingRoomReservation mrRes)
	{
		boolean isValid = true;
     	
		List<ReservationTimeIntervalItemBean> reservationItems  = DateTimeUtil.getReservationTimeIntervalRecords(mrRes);
		List<ReservationTimeIntervalItemBean> result = null;
     	if (mrRes.getReservationType().equals(ReservationType.SINGLE))
     	{
     		result = reservationDao.checkReservationDateRange(reservationItems.get(0));
     		if (result != null && result.size() > 0)
     		{
     			isValid = false;
     		}
     		
     	}
     	else if (mrRes.getReservationType().equals(ReservationType.RECURRENT))
     	{
     		if (reservationItems.size() < NOT_CACHE_COUNT)
     		{
     			for (ReservationTimeIntervalItemBean item : reservationItems)
     			{
     				result = reservationDao.checkReservationDateRange(item);
     				if (result != null && result.size() > 0)
     	     		{
     	     			isValid = false;
     	     			break;
     	     		}
     			}
     		}
     		else
     		{
     			boolean isFinished = reservationDao.saveReservationTimeIntervalItems(reservationItems, true);
     			if (isFinished)
     			{
     				result = reservationDao.checkCachedReservationDateRange();
     			}
     			
     			if (result != null && result.size() > 0)
         		{
         			isValid = false;
         		}
     		}
     	}
     
     	if (isValid)
     	{
     		reservationDao.saveReservationTimeIntervalItems(reservationItems, false);
     	}
		 
		return isValid;
	}
		
}
