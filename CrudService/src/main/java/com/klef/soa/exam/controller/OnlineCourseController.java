package com.klef.soa.exam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klef.soa.exam.entity.OnlineCourse;
import com.klef.soa.exam.service.OnlineCourseService;

@RestController
@RequestMapping("/onlinecourse")
public class OnlineCourseController {

    @Autowired
    private OnlineCourseService service;

    @GetMapping("/")
    public String demo() {

        return "Online Course Service Project";
    }

    @PostMapping("/add")
    public ResponseEntity<OnlineCourse> addOnlineCourse(
            @RequestBody OnlineCourse course) {

        return ResponseEntity.status(201)
                .body(service.addOnlineCourse(course));
    }

    @GetMapping("/displayall")
    public ResponseEntity<List<OnlineCourse>> displayAll() {

        return ResponseEntity.ok(service.displayAll());
    }

    @GetMapping("/display/{ocid}")
    public ResponseEntity<OnlineCourse> displayById(
            @PathVariable("ocid") long ocid) {

        return ResponseEntity.ok(service.displayById(ocid));
    }

    @PutMapping("/update/{ocid}")
    public ResponseEntity<OnlineCourse> updateOnlineCourse(
            @PathVariable("ocid") long ocid,
            @RequestBody OnlineCourse course) {

        return ResponseEntity.ok(
                service.updateOnlineCourse(ocid, course));
    }

    @DeleteMapping("/delete/{ocid}")
    public ResponseEntity<Void> deleteOnlineCourse(
            @PathVariable("ocid") long ocid) {

        service.deleteOnlineCourseById(ocid);

        return ResponseEntity.noContent().build();
    }
}