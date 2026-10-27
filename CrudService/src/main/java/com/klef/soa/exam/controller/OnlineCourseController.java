package com.klef.soa.exam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klef.soa.exam.entity.OnlineCourse;
import com.klef.soa.exam.service.OnlineCourseService;


@RestController
@RequestMapping("onlinecourse")
public class OnlineCourseController {
	@Autowired
	private OnlineCourseService service;
	
	@GetMapping("/")
	public String demo() {
		return "Online Course Service Project";
	}
	
	@PostMapping("add")
	public ResponseEntity<OnlineCourse> addOnlineCourse(@RequestBody OnlineCourse ocid) {
		return ResponseEntity.status(201).body(service.addOnlineCourse(ocid));
	}
	
	@GetMapping("displayall")
	public ResponseEntity<List<OnlineCourse>> displayAll() {
		List<OnlineCourse> onlinecourses = service.displayAll();
		return ResponseEntity.status(200).body(onlinecourses);		
	}
	
	@DeleteMapping("delete/{ocid}")
	public ResponseEntity<String> deleteOnlineCourse(@PathVariable long ocid) {
		return ResponseEntity.status(200).body(service.deleteOnlineCourseById(ocid));
	}
	
}
