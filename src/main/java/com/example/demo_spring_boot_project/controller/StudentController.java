package com.example.demo_spring_boot_project.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo_spring_boot_project.entity.Student;
import com.example.demo_spring_boot_project.service.StudentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/student")// /student/** 

@CrossOrigin(origins ="http://localhost:3000/")// 8080, 3000
@Tag(name="Student API", description="Operation related to student schema")
public class StudentController {
	 
	@Autowired
	private StudentService service;// null
	
	
	
	
	
	
	@Operation(
			summary="Create Student",
			description="Create a new Student in the table"
			)
	
	@PostMapping
	public String insertStudent(@RequestBody Student s) {
		return service.insertStudent(s);
	}
	
	@Operation(
			summary="List all the Student Detials",
			description="Fetch all the Student Data From the table"
			)
	@GetMapping
	public List<Student> getAllStudentData(){
		return service.getAllStudentData();
	}
	
	@Operation(
			summary="Create Multiple Student Data",
			description="Create Many Student data in the table at once"
			)
	@PostMapping("/list")  // http://localhost:8080/student/list
	public String insertListStudent(@RequestBody List<Student> student) {
		return service.insertListStudent(student);
	}
	
	@Operation(
			summary="Find the student data by Id",
			description="Fetch the Student data from the table using ID"
			)
	@GetMapping("/id/{id}")
	public Student getById(@PathVariable int id) {
		return service.getById(id);
	}
	
	@Operation(
			summary="Find the student data by Name",
			description="Fetch the Student data from the table taking student name as input"
			)
	@GetMapping("/name/{name}")
	public Student findByName(@PathVariable String name) {
		return service.findByName(name);
	}
	
	@Operation(
			summary="Find the student data by Percentage",
			description="Fetch the Student data from the table taking student percentage as input"
			)
	@GetMapping("/percenatge/{percentage}")
	public List<Student> findStudentByPercentage(@PathVariable double percentage) {
		return service.findStudentByPercentage(percentage);
	}
	
	@Operation(
			summary="Removes students data",
			description="Removes student data using Id"
			)
	@DeleteMapping("/id/{id}")
	public String deleteStudentById(@PathVariable int id) {
		return service.deleteStudentById(id);
	}
	
	@Operation(
			summary="Update Student Email",
			description="Update Student Email using Id"
			)
	@PutMapping("/email/{id}/{email}")
	public String updateStudentEmailById(@PathVariable int id,@PathVariable String email) {
		return service.updateStudentEmailById(id, email);
	}
	
	@Operation(
			summary="Sort Student Data ",
			description="Sorts the Student data using filed name "
			)
	@GetMapping("/sort/{columnName}")
	public List<Student> sortByColumn(@PathVariable String columnName){
		return service.sortByColumn(columnName);
	}
	
	@Operation(
			summary="Update Student grade",
			description="Assing grade to student percentage"
			)
	@PatchMapping("/grade")
	public int updateStudentGradeByPercentage(@RequestParam double start,@RequestParam  double end,@RequestParam  String grade) {
		return service.updateStudentGradeByPercentage(start, end, grade);
	}
	
	@Operation(
			summary="Student Section",
			description="Assing Section to student grade"
			)
	@PatchMapping("/section")
	public int updateSectionByStudentGrade(@RequestParam String grade,@RequestParam String section) {
		return service.updateSectionByStudentGrade(grade, section);
	}
	
	@Operation(
			summary="Page the Student data",
			description="Page the Student data with page_no and data_size"
			)
	@GetMapping("/page/{page_no}/{data_size}")
	public List<Student> pageData(@PathVariable int page_no,@PathVariable int data_size){
		return service.pageData(page_no, data_size);
	}
	
	
	
}
