package com.ect.util;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.BeanUtils;

import com.ect.domainobject.MeetingRoom;
import com.ect.domainobject.MeetingRoomReservation;
import com.ect.domainobject.ReservationTimeIntervalItemBean;
import com.ect.domainobject.TimeInterval;
import com.ect.vo.MeetingRoomReservationVO;
import com.ect.vo.MeetingRoomVO;
import com.ect.vo.ReservationTimeIntervalItemVO;

public class MeetingRoomUtil
{

	public static Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> classifyRerservationItemsByRerservation(
			List<ReservationTimeIntervalItemBean> items)
	{
		Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> mrr = new HashMap<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>>();
		for (ReservationTimeIntervalItemBean item : items)
		{
			if (mrr.containsKey(item.getReservation()))
			{
				mrr.get(item.getReservation()).add(item);
			}
			else
			{
				List<ReservationTimeIntervalItemBean> resItems = new ArrayList<ReservationTimeIntervalItemBean>();
				resItems.add(item);
				mrr.put(item.getReservation(), resItems);
			}
			
		}
		return mrr;
	}
	
	public static List<ReservationTimeIntervalItemVO> convertReservationTimeIntervalItemForUI(List<ReservationTimeIntervalItemBean> items)
	{
		List<ReservationTimeIntervalItemVO> result = new ArrayList<ReservationTimeIntervalItemVO>();
		if (items == null)
		{
			return result;
		}
		ReservationTimeIntervalItemVO itemVO = null;
		for (ReservationTimeIntervalItemBean it : items)
		{
			itemVO = new ReservationTimeIntervalItemVO();
			BeanUtils.copyProperties(it, itemVO);
			itemVO.setMrId(it.getMeetingRoom().getId());
			itemVO.setMrrId(it.getReservation().getId());
			result.add(itemVO);
		}
		
		return result;
	}
	
	public static List<MeetingRoomReservationVO> convertMeetingRoomResult(
			List<MeetingRoomReservation> rem)
	{
		List<MeetingRoomReservationVO> result = new ArrayList<MeetingRoomReservationVO>();
		MeetingRoomVO mrVo = null;
		MeetingRoomReservationVO vo = null;
		for (MeetingRoomReservation mr : rem)
		{
			vo = new MeetingRoomReservationVO();
			mrVo = new MeetingRoomVO();
			BeanUtils.copyProperties(mr, vo);
			BeanUtils.copyProperties(mr.getMeetingRoom(), mrVo);
			vo.setMeetingRoom(mrVo);
			result.add(vo);
		}
		return result;
	}
	
	public static List<MeetingRoomReservationVO> getMeetingRoomReservationVo(List<ReservationTimeIntervalItemBean> items, boolean isItemsNeeded)
	{
		List<MeetingRoomReservationVO> mrr = new ArrayList<MeetingRoomReservationVO>();
		if (items == null)
		{
			return mrr;
		}
		Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> tempData = classifyRerservationItemsByRerservation(items);
		Set<MeetingRoomReservation>  mrItems = tempData.keySet();
		MeetingRoomReservationVO mrVo = null;
		for (MeetingRoomReservation item : mrItems)
		{
			mrVo = new MeetingRoomReservationVO();
			BeanUtils.copyProperties(item, mrVo);
			if (isItemsNeeded)
			{
				mrVo.setItems(convertReservationTimeIntervalItemForUI(tempData.get(item)));
			}
			mrr.add(mrVo);
		}
		
		return mrr;
	}
	
	public static boolean isMeetingRoomAvaliable(List<ReservationTimeIntervalItemBean> items)
	{
		boolean isAvaliable = false;
		if (items.size() == 0)
		{
			return true;
		}
		List<TimeInterval> result = new ArrayList<TimeInterval>();
		TimeInterval ti = new TimeInterval();
		ti.setStartDate(DateTimeUtil.getDateWithoutTime(new Date()));
		ti.setEndDate(DateTimeUtil.getAddedDaysDate(ti.getStartDate(), 1));
		result.add(ti);
		
		for (ReservationTimeIntervalItemBean item : items)
		{
			getAvaliableTimeInterval(result, item);
		}
		
		for (TimeInterval tm : result)
		{
			if (tm.isAvaliableInterval())
			{
				isAvaliable = true;
				break;
			}
		}
		
		return isAvaliable;
	}
	
	private static List<TimeInterval> getAvaliableTimeInterval (List<TimeInterval> sourceTimeItem, ReservationTimeIntervalItemBean item)
	{
		for (TimeInterval ti : sourceTimeItem)
		{
			if (ti.getStartDate().before(item.getStartTime()) && ti.getEndDate().after(item.getStartTime()))
			{
				TimeInterval insertTM = new TimeInterval();
				if (ti.getEndDate().after(item.getEndTime()))
				{
					insertTM.setStartDate(item.getEndTime());
					insertTM.setEndDate(ti.getEndDate());
				}
				
				ti.setEndDate(item.getStartTime());
				if (insertTM.getStartDate() != null)
				{
					sourceTimeItem.add(insertTM);
				}
				break;
			}
			else if (ti.getStartDate().before(item.getEndTime()) && ti.getEndDate().after(item.getEndTime()))
			{
				TimeInterval insertTM = new TimeInterval();
				if (ti.getStartDate().before(item.getStartTime()))
				{
					insertTM.setStartDate(ti.getStartDate());
					insertTM.setEndDate(item.getStartTime());
				}

				ti.setStartDate(item.getEndTime());
				if (insertTM.getStartDate() != null)
				{
					sourceTimeItem.add(insertTM);
				}
				break;
			}
		}
		
		return sourceTimeItem;
	}
	
	public static Map<MeetingRoom, List<MeetingRoomReservationVO>> getMeetingRoomReservationsByResItems(List<ReservationTimeIntervalItemBean> items)
	{
		Map<MeetingRoom, List<MeetingRoomReservationVO>> mrr = new HashMap<MeetingRoom, List<MeetingRoomReservationVO>>();
		Map<MeetingRoomReservation, List<ReservationTimeIntervalItemBean>> tempData = classifyRerservationItemsByRerservation(items);
		Set<MeetingRoomReservation>  mrItems = tempData.keySet();
		MeetingRoomReservationVO mrVo = null;
		for (MeetingRoomReservation item : mrItems)
		{
			if (mrr.containsKey(item.getMeetingRoom()))
			{
				mrVo = new MeetingRoomReservationVO();
				BeanUtils.copyProperties(item, mrVo);
				mrVo.setItems(convertReservationTimeIntervalItemForUI(tempData.get(item)));
				mrr.get(item.getMeetingRoom()).add(mrVo);
			}
			else
			{
				List<MeetingRoomReservationVO> resItems = new ArrayList<MeetingRoomReservationVO>();
				mrVo = new MeetingRoomReservationVO();
				BeanUtils.copyProperties(item, mrVo);
				mrVo.setItems(convertReservationTimeIntervalItemForUI(tempData.get(item)));
				resItems.add(mrVo);
				mrr.put(item.getMeetingRoom(), resItems);
			}
			
		}
		
		return mrr;
	}
	
	public static Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> classifyRerservationItemsByMeetingRoom(
			List<ReservationTimeIntervalItemBean> items)
	{
		Map<MeetingRoom, List<ReservationTimeIntervalItemBean>> mrr = new HashMap<MeetingRoom, List<ReservationTimeIntervalItemBean>>();
		for (ReservationTimeIntervalItemBean item : items)
		{
			if (mrr.containsKey(item.getReservation()))
			{
				mrr.get(item.getMeetingRoom()).add(item);
			}
			else
			{
				List<ReservationTimeIntervalItemBean> resItems = new ArrayList<ReservationTimeIntervalItemBean>();
				resItems.add(item);
				mrr.put(item.getMeetingRoom(), resItems);
			}
			
		}
		return mrr;
	}

}
