package com.ect.vo;

import com.ect.domainobject.Role;

public class UserVO {
	private Integer id;
	private String name;
	private Integer location;
	private String email;
	private String bu;
	private Role role;
	private String password;
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Integer getLocation() {
		return location;
	}
	public void setLocation(Integer location) {
		this.location = location;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getBu() {
		return bu;
	}
	public void setBu(String bu) {
		this.bu = bu;
	}
	public Role getRole() {
		return role;
	}
	public void setRole(Role role) {
		this.role = role;
	}
	
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	@Override
	public String toString() {
		return "UserVO [id=" + id + ", name=" + name + ", location=" + location
				+ ", email=" + email + ", bu=" + bu + ", role=" + role + ", password=********]";
	}
	
	
}
