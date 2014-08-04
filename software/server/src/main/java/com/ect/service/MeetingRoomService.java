package com.ect.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.MeetingRoomDao;
import com.ect.domainobject.MeetingRoom;
import com.ect.vo.MeetingRoomVO;

@Transactional
@Service
public class MeetingRoomService {
	
	@Autowired
	private MeetingRoomDao dao;
	
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
	
}
