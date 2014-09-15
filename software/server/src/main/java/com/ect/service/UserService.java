package com.ect.service;

import java.util.List;

import javax.naming.ldap.LdapContext;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ect.dao.UserDao;
import com.ect.domainobject.Role;
import com.ect.domainobject.User;
import com.ect.vo.UserVO;

@Transactional
@Service
public class UserService {
	@Autowired
	private UserDao dao;
	

	@Autowired
	private ActiveDirectory activeDirectory;

	public UserVO getUserByEmail(String email) {
		User user = new User();
		user.setEmail(email);
		List<User> users = dao.findByExample(user);
		if (users != null && users.size() == 1) {
			user = users.get(0);
			UserVO result = new UserVO();
			BeanUtils.copyProperties(user, result);
			return result;
		} else {
			// can't find user by email.
			return null;
		}
	}

	public UserVO getUserById(Integer id) {
		User user = new User();

		user = dao.get(user, id);

		UserVO result = new UserVO();
		BeanUtils.copyProperties(user, result);
		return result;

	}

	public UserVO authenticate(String username, String password) {
		User user = new User();
		user.setName(username);
		user.setPassword(password);
		List<User> users = dao.findByExample(user);
		if (users != null && users.size() == 1) {
			user = users.get(0);
			UserVO result = new UserVO();
			BeanUtils.copyProperties(user, result);
			return result;
		} else {
			// can't find user by email.
			LdapContext context;
			try {
				context = ActiveDirectory.getConnection(username, password,"emrsn.org");
			} catch (Exception e) {
				return null;
			}
			ActiveDirectory.User activeUser=ActiveDirectory.getUser(username, context);
			
		  	UserVO result=new UserVO();
		  	result.setName(activeUser.getCommonName());
		  	result.setEmail(activeUser.getEmail());
		  	result.setRole(Role.USER);
		  	UserVO	puser=getUserByEmail(activeUser.getUserPrincipal());
			if(puser==null){
				//user not exists
				user=new User();
				BeanUtils.copyProperties(result,user);
				dao.saveOrUpdate(user);
				result.setId(user.getId());
			}else{
				result.setId(puser.getId());
			}
			return result;
		}
	}

	public void delete(Integer id) {
		User user = new User();
		user.setId(id);
		dao.delete(user);
	}

	public UserVO saveOrUpdate(UserVO userVO) {
		User user = new User();
		BeanUtils.copyProperties(userVO, user);
		dao.saveOrUpdate(user);
		userVO.setId(user.getId());
		return userVO;
	}
}
