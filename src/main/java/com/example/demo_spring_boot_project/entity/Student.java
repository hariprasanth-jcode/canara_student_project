package com.example.demo_spring_boot_project.entity;

import org.springframework.stereotype.Component;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// jakarata
@Entity
@Table(name="student_data")
public class Student {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="s_id")
	private int id;
	@Column(name="s_name")
	private String name;
	@Column(name="s_percentage")
	private double percentage;
	@Column(name="s_email")
	private String email;
	
	@Column(name="s_grade")
	private String grade;
	
	@Column(name="s_section")
	private String section;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public double getPercentage() {
		return percentage;
	}
	public void setPercentage(double percentage) {
		this.percentage = percentage;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getGrade() {
		return grade;
	}
	public void setGrade(String grade) {
		this.grade = grade;
	}
	
	
	public String getSection() {
		return section;
	}
	public void setSection(String section) {
		this.section = section;
	}
	
	@Override
	public String toString() {
		return "Student [id=" + id + ", name=" + name + ", percentage=" + percentage + ", email=" + email + ", grade="
				+ grade + ", section=" + section + "]";
	}
	
	
	
	
	
	
	
	
	
}
