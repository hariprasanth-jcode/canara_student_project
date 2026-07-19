package com.example.demo_spring_boot_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@OpenAPIDefinition(
		info=@Info(
			title="Student Directory Application",
			version="1.0",
			description="Rest API for Student Directory Application",
			
			contact=@Contact(
				name="Hariprasanth",
				email="hari.mba000@gmail.com",
				url="https://github.com/hariprasanth-jcode"
					)
			
				)
		
		)

public class DemoSpringBootProjectApplication {

	public static void main(String[] args) {
	ApplicationContext	ac=SpringApplication.run(DemoSpringBootProjectApplication.class, args);
	
	  
	}

}
