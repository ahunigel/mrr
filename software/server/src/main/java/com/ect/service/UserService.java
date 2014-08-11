package com.ect.service;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.UserDao;
import com.ect.domainobject.User;
import com.ect.vo.UserVO;

@Transactional
@Service
public class UserService {
	@Autowired
	private UserDao dao;
	
	
	public UserVO getUserByEmail(String email){
		User user=new User();
		user.setEmail(email);
		List<User> users=dao.findByExample(user);
		if(users!=null && users.size()==1){
			user=users.get(0);
			UserVO result=new UserVO();
			BeanUtils.copyProperties(user, result);
			return result;
		}
		else
		{
			//can't find user by email.
			return null;
		}
	}
	
	public UserVO authenticate(String username,String password){
		User user=new User();
		user.setName(username);
		user.setBu(password);
		List<User> users=dao.findByExample(user);
		if(users!=null && users.size()==1){
			user=users.get(0);
			UserVO result=new UserVO();
			BeanUtils.copyProperties(user, result);
			return result;
		}
		else
		{
			//can't find user by email.
			return null;
		}
	}
	
	public void delete(Integer id){
		User user=new User();
		user.setId(id);
		dao.delete(user);
	}
	
	public UserVO saveOrUpdate(UserVO userVO){
		User user=new User();
		BeanUtils.copyProperties(userVO, user);
		dao.saveOrUpdate(user);
		userVO.setId(user.getId());
		return userVO;
	}
}
