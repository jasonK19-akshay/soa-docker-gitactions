package com.klef.soa.exam.service;

import java.util.List;

import com.klef.soa.exam.entity.OnlineCourse;

public interface OnlineCourseService {

    OnlineCourse addOnlineCourse(OnlineCourse course);

    List<OnlineCourse> displayAll();

    OnlineCourse displayById(long ocid);

    OnlineCourse updateOnlineCourse(long ocid, OnlineCourse course);

    void deleteOnlineCourseById(long ocid);
}