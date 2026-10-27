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
@RequestMapping("/api/courses")
public class OnlineCourseController {

    @Autowired
    private OnlineCourseService service;

    // CREATE
    @PostMapping
    public ResponseEntity<OnlineCourse> addOnlineCourse(
            @RequestBody OnlineCourse course) {

        OnlineCourse saved =
                service.addOnlineCourse(course);

        return ResponseEntity.status(201).body(saved);
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<OnlineCourse>> displayAll() {

        return ResponseEntity.ok(service.displayAll());
    }

    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<OnlineCourse> displayById(
            @PathVariable("id") long id) {

        return ResponseEntity.ok(
                service.displayById(id));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<OnlineCourse> updateOnlineCourse(
            @PathVariable("id") long id,
            @RequestBody OnlineCourse course) {

        return ResponseEntity.ok(
                service.updateOnlineCourse(id, course));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOnlineCourse(
            @PathVariable("id") long id) {

        service.deleteOnlineCourseById(id);

        return ResponseEntity.noContent().build();
    }
}