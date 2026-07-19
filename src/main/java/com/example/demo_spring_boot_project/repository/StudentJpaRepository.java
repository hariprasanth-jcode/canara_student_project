package com.example.demo_spring_boot_project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo_spring_boot_project.entity.Student;

import jakarta.transaction.Transactional;

public interface StudentJpaRepository extends JpaRepository<Student,Integer> {

	// findBy , readyBy , getBy
	public Student findByName(String name);
	// spring select
	// findByPercentage
	public List<Student> findByPercentage(double percenatge);
	// Jpql
	
	@Query("update Student s set s.grade=:grade  where s.percentage>=:start  and s.percentage<=:end")
    @Modifying
    @Transactional
	int updateStudentGradeByPercentage(@Param("start") double start,@Param("end") double end,@Param("grade") String grade);
	// start end ---> delete--> 50 60
	// SQL
	
	@Query(value="delete student_data where s_percentage>=:start and s_percentage<=:end",nativeQuery=true)
	@Modifying
	@Transactional
	int deleteStudentByPercentage(@Param("start") double start,@Param("end") double end);
    /**
     * 
     *    O and O+ --> A
     *    A and A+ --> B
     *    Less than A --> C
     */
	@Query(value="update student_data set s_section=:section where s_grade=:grade",nativeQuery=true)
	@Modifying
	@Transactional
	int updateSectionByStudentGrade(@Param("grade") String grade,@Param("section") String section);
	
	

}
