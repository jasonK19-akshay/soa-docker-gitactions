package com.klef.soa.exam.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.soa.exam.entity.OnlineCourse;
import com.klef.soa.exam.repository.OnlineCourseRepository;

@Service
public class OnlineCourseServiceImpl implements OnlineCourseService {
	@Autowired
	private OnlineCourseRepository repo;

	@Override
	public OnlineCourse addOnlineCourse(OnlineCourse ocid) {
		// TODO Auto-generated method stub
		return repo.save(ocid);
	}

	@Override
	public List<OnlineCourse> displayAll() {
		// TODO Auto-generated method stub
		return repo.findAll();
	}

	@Override
	public String deleteOnlineCourseById(long ocid) {
		boolean flag = repo.existsById(ocid);
		if(flag) {
			repo.deleteById(ocid);
			return "Online Course deleted successfully";
		}
		return "Online Course ID has not found";
	}
	
	
}
