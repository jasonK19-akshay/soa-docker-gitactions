package com.klef.soa.exam.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.klef.soa.exam.entity.OnlineCourse;
import com.klef.soa.exam.repository.OnlineCourseRepository;

@Service
public class OnlineCourseServiceImpl
        implements OnlineCourseService {

    @Autowired
    private OnlineCourseRepository repo;

    @Override
    public OnlineCourse addOnlineCourse(OnlineCourse course) {

        validateCourse(course);

        // Generate the ID automatically during insertion.
        course.setId(0);

        return repo.save(course);
    }

    @Override
    public List<OnlineCourse> displayAll() {

        return repo.findAll();
    }

    @Override
    public OnlineCourse displayById(long ocid) {

        return findCourse(ocid);
    }

    @Override
    public OnlineCourse updateOnlineCourse(
            long ocid, OnlineCourse course) {

        validateCourse(course);

        OnlineCourse existingCourse = findCourse(ocid);

        existingCourse.setTitle(course.getTitle());
        existingCourse.setPlatformName(course.getPlatformName());
        existingCourse.setDurationHours(course.getDurationHours());
        existingCourse.setPaid(course.isPaid());

        return repo.save(existingCourse);
    }

    @Override
    public void deleteOnlineCourseById(long ocid) {

        OnlineCourse course = findCourse(ocid);

        repo.delete(course);
    }

    private OnlineCourse findCourse(long ocid) {

        if (ocid <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Course ID must be positive");
        }

        return repo.findById(ocid)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Online course not found with ID: "
                                        + ocid));
    }

    private void validateCourse(OnlineCourse course) {

        if (course == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Course details are required");
        }

        if (course.getTitle() == null
                || course.getTitle().trim().isEmpty()
                || course.getTitle().trim().length() > 50) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Title is required and must not exceed 50 characters");
        }

        if (course.getPlatformName() == null
                || course.getPlatformName().trim().isEmpty()
                || course.getPlatformName().trim().length() > 50) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Platform name is required and must not exceed 50 characters");
        }

        if (course.getDurationHours() < 1
                || course.getDurationHours() > 10000) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Duration must be between 1 and 10000 hours");
        }

        course.setTitle(course.getTitle().trim());
        course.setPlatformName(course.getPlatformName().trim());
    }
}