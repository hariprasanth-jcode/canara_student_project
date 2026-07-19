package com.example.demo_spring_boot_project.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApplicationException {
	
	// Exception Handling code
	// Catch
	@ExceptionHandler(IdNotFoundException.class)
	public ResponseEntity IdNotPresent(IdNotFoundException exception) {
		
		return  new ResponseEntity(exception.getMessage(),HttpStatus.NOT_FOUND);
		
	}
	
	// EmailNotFound
	// Section Not Found
	
	@ExceptionHandler(NegativePercentageException.class)
	public ResponseEntity percentageNegativeException(NegativePercentageException exception) {
		
		return  new ResponseEntity(exception.getMessage(),HttpStatus.BAD_REQUEST);
		
	}
	

}
