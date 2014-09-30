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

	@Autowired
	private MeetingRoomDao dao;

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
}
