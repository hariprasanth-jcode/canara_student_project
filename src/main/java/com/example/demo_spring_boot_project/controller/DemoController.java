package com.example.demo_spring_boot_project.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo_spring_boot_project.entity.Student;

@RestController// check view page html,js
public class DemoController {
	
	
	
	@PostMapping("/logout")
	public String logout() {
	
		return "logout";
	}

	@GetMapping("/hi")// http://localhost:8080/hi
	public String hello() {
		return "Spring boot";
	}
	
	@PostMapping("/hello")// http://localhost:8080/hello?email=
	public String create(@RequestParam String email) {
		return "User registered "+email;
	}
	
	@PostMapping("/create1")
	public String create1(@RequestParam String email,@RequestParam String password) {
		
		System.out.println("Email : "+email);
		System.out.println("Password : "+password);
		return email + " Registered Successfully ";
	}
	
	@PostMapping("/create2/{name}") // http://localhost:8080/create2/miller
	public String create2(@PathVariable String name) {
		
		return name + " Sucessfully registered";
	}
	
	@PostMapping("/create3/{name}/{age}")
	public String create3(@PathVariable String name,@PathVariable int age) {
		
		return name + "Sucessfully registered";
	}
	
	@PostMapping("/create4")
	public String create4(@RequestBody Student s) {

		System.out.println(s);
		return s.getName()+" Added ";
		
	}
	
	@PostMapping("/create5")
	public String create5(@RequestBody List<String> list){
		
		System.out.println(list);
		return "List Added";
	}
	
	// List<Student>
	
	@PostMapping("/create6")
	public String create6(@RequestBody List<Student> list){
		System.out.println(list);
		return "List Added";
	}
	
	
	
	
	
	
	
}
