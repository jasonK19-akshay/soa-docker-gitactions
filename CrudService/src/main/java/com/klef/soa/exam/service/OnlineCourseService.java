package com.klef.soa.exam.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.klef.soa.exam.entity.OnlineCourse;

@Service
public interface OnlineCourseService {
	OnlineCourse addOnlineCourse(OnlineCourse ocid);
	List<OnlineCourse> displayAll();
	String deleteOnlineCourseById(long ocid);

}
