package com.example.demo_spring_boot_project.exception;

public class IdNotFoundException extends RuntimeException{
	
	public IdNotFoundException(String message) {
		super(message);
	}

}
