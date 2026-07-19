package com.example.demo_spring_boot_project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable()) // Disable CSRF to allow frontend calls
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated() // All other requests require authentication
            )
            .formLogin(form -> form
                .defaultSuccessUrl("/index.html", true) // Redirect back to original target (e.g. index.html or swagger) after login
            )
            .logout(Customizer.withDefaults()) // Enable default logout redirect to /login?logout
            .build();
    }
}
