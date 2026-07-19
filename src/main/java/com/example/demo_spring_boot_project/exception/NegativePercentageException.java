package com.example.demo_spring_boot_project.exception;

public class NegativePercentageException extends RuntimeException{

	
	public NegativePercentageException(String message) {
		super(message);
	}
}
