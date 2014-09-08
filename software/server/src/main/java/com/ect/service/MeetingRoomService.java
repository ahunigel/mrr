package com.ect.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.MeetingRoomDao;
import com.ect.dao.ReservationMeetingRoomDao;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
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
	
	public List<MeetingRoomReservationVO> getAllMeetingRoomReservation()
	{
		List<MeetingRoomReservation> rem = reservationDao.findAll();
		
		List<MeetingRoomReservationVO> result=new ArrayList<MeetingRoomReservationVO>();
		for(MeetingRoomReservation mr:rem){
			MeetingRoomReservationVO vo=new MeetingRoomReservationVO();
			BeanUtils.copyProperties(mr, vo);
			result.add(vo);
		}
		
		return result;
	}
	
	public List<MeetingRoomReservationVO> getReservationByMeetingRoom(Integer id)
	{
		List<MeetingRoomReservation> rem = reservationDao.findAll();
		
		List<MeetingRoomReservationVO> result=new ArrayList<MeetingRoomReservationVO>();
		for(MeetingRoomReservation mr:rem){
			MeetingRoomReservationVO vo=new MeetingRoomReservationVO();
			BeanUtils.copyProperties(mr, vo);
			result.add(vo);
		}
		
		return result;
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
	
}
