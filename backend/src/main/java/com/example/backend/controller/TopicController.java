package com.example.backend.controller;

import com.example.backend.dto.TopicDTO;
import com.example.backend.model.Topic;
import com.example.backend.service.TopicService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    @Autowired
    private TopicService topicService;

    // Get all active topics
    @GetMapping
    public ResponseEntity<List<Topic>> getAllTopics() {
        List<Topic> topics = topicService.getAllTopics();
        return ResponseEntity.ok(topics);
    }

    // Get all trashed topics
    @GetMapping("/trash")
    public ResponseEntity<List<Topic>> getTrashedTopics() {
        List<Topic> topics = topicService.getTrashedTopics();
        return ResponseEntity.ok(topics);
    }

    // Get topic by ID
    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable Long id) {
        Topic topic = topicService.getTopicById(id);
        return ResponseEntity.ok(topic);
    }

    // Create a new topic
    @PostMapping
    public ResponseEntity<Topic> createTopic(@Valid @RequestBody TopicDTO topicDTO) {
        Topic createdTopic = topicService.createTopic(topicDTO);
        return new ResponseEntity<>(createdTopic, HttpStatus.CREATED);
    }

    // Update a topic
    @PutMapping("/{id}")
    public ResponseEntity<Topic> updateTopic(@PathVariable Long id, @Valid @RequestBody TopicDTO topicDTO) {
        Topic updatedTopic = topicService.updateTopic(id, topicDTO);
        return ResponseEntity.ok(updatedTopic);
    }

    // Soft delete (move to trash)
    @PutMapping("/trash/{id}")
    public ResponseEntity<Void> moveToTrash(@PathVariable Long id) {
        topicService.softDeleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    // Toggle topic status
    @PutMapping("/status/{id}")
    public ResponseEntity<Topic> toggleStatus(@PathVariable Long id) {
        Topic updatedTopic = topicService.toggleStatus(id);
        return ResponseEntity.ok(updatedTopic);
    }

    // Delete a topic permanently
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    // Restore a trashed topic
    @PutMapping("/restore/{id}")
    public ResponseEntity<Topic> restoreTopic(@PathVariable Long id) {
        Topic restoredTopic = topicService.restoreTopic(id);
        return ResponseEntity.ok(restoredTopic);
    }
}
