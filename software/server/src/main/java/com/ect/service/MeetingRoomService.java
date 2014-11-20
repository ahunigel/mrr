package com.ect.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.MeetingRoomDao;
import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomImage;
import com.ect.util.AppUtils;
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
		String originalImg = "";
		if(meetingRoom.getId() != null)
		{
			dao.get(mr, meetingRoom.getId());
			originalImg = mr.getImage();
		}
		
		BeanUtils.copyProperties(meetingRoom, mr);
		
		if((meetingRoom.getId()==null 
					&& meetingRoom.getImage()!=null 
					&& !"".equals(meetingRoom.getImage().trim()))
			||(meetingRoom.getId()!=null 
				&& !meetingRoom.getImage().equals(originalImg))
			)
		{
			String fileName = meetingRoom.getImage();
			File imgFolder=AppUtils.getImageFolder();
			File img=new File(imgFolder,fileName);
			byte[] imgContent = new byte[(int) img.length()];
			FileInputStream finput = null;
			try {
				finput = new FileInputStream(img);
				finput.read(imgContent); 
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}
			catch (IOException e) {
				e.printStackTrace();
			}
			finally
			{
				try {
					finput.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			
			MeetingRoomImage roomImg = null;
			
			if(mr.getId()!=null && mr.getMeetingRoomImg()!=null)
			{
				roomImg = mr.getMeetingRoomImg();
			}
			else
			{
				roomImg = new MeetingRoomImage();
			}

			roomImg.setContent(imgContent);
			mr.setMeetingRoomImg(roomImg);
			roomImg.setMeetRoom(mr);
		}
		
		dao.saveOrUpdate(mr);
		meetingRoom.setId(mr.getId());
		return meetingRoom;
	}
	
	public boolean checkName(Integer mrId, String name)
	{
		return dao.checkMeetingRoomName(mrId, name);
	}
}
