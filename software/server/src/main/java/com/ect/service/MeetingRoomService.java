package com.ect.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.MeetingRoomDao;
import com.ect.dao.ReservationMeetingRoomDao;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationType;
import com.ect.domainobject.User;
import com.ect.util.DateTimeUtil;
import com.ect.vo.MeetingRoomReservationVO;
import com.ect.vo.MeetingRoomVO;

@Transactional
@Service
public class MeetingRoomService {
	
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
		reservationDao.saveOrUpdate(mr);
		mrr.setId(mr.getId());
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
	
	private boolean isValidDayForReservation(int intervalDays, MeetingRoomReservation mrRes)
	{
		boolean isValid = true;
		if (mrRes.getReservationType().equals(ReservationType.SINGLE))
		{
			if (intervalDays == 0)
			{
				isValid = false;
			}
		}
		else if (mrRes.getReservationType().equals(ReservationType.RECURRENT))
		{
			switch (mrRes.getRecurrentType())
			{
			
			case DAILY:
				if (intervalDays % mrRes.getRecurrentInterval() == 0){
					isValid = false;
				}
				break;
			case DAILY_WORKDAY:
				if (intervalDays % mrRes.getRecurrentInterval() == 0 || DateTimeUtil.isWorkingDay(mrRes.getStartTime())){
					isValid = false;
				}
				break;
			case WEEKLY:
				if (intervalDays % (mrRes.getRecurrentInterval()*7) == 0){
					isValid = false;
				}
				break;
				
			case MONTHLY:
				if (intervalDays == 0)
				{
					isValid = false;
				}
				break;
				
			default:
				break;
			}
		}
		
		return isValid;
	}
	
	public boolean isValidReservation(MeetingRoomReservation mrRes)
	{
		boolean isValid = true;
		 List<MeetingRoomReservation> result = reservationDao.checkReservationDateRange(mrRes);
		if (result.size() == 0)
		{
			isValid = true;
			return isValid;
		}
        for (MeetingRoomReservation mrr : result)
        {
        	if (mrRes.getReservationType().equals(ReservationType.SINGLE))
        	{
        		
        		int intervalDays = DateTimeUtil.getIntervalDaysBetweenDates(mrr.getStartTime(), mrRes.getStartTime());
        		
        		
        		if (!isValidDayForReservation(intervalDays, mrr))
        		{
        			break;
        		}
        		
        	}
        	else if (mrRes.getReservationType().equals(ReservationType.RECURRENT))
        	{
        		int intervalDays = DateTimeUtil.getIntervalDaysBetweenDates(mrr.getStartTime(), mrRes.getStartTime());
        		switch (mrRes.getRecurrentType())
        		{
        		
        		case DAILY:
        			break;
        		case DAILY_WORKDAY:
        			
        			break;
        		case WEEKLY:
        			
        			break;
        			
        		case MONTHLY:
        			
        			break;
        			
        		default:
        			break;
        		}
        	}
        }
		
		return isValid;
	}
		
}
