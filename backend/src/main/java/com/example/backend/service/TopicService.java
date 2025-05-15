package com.example.backend.service;

import com.example.backend.dto.TopicDTO;
import com.example.backend.model.Topic;
import com.example.backend.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TopicService {

    @Autowired
    private TopicRepository topicRepository;

    // Get all active topics (not trashed)
    public List<Topic> getAllTopics() {
        return topicRepository.findByTrashFalse();
    }

    // Get all trashed topics
    public List<Topic> getTrashedTopics() {
        return topicRepository.findByTrashTrue();
    }

    // Soft delete (move to trash)
    public void softDeleteTopic(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic with ID " + id + " does not exist"));

        topic.setTrash(true);
        topic.setUpdatedAt(LocalDateTime.now());
        topicRepository.save(topic);
    }

    // Updated getTopicById to remove Optional and provide meaningful error messages
    public Topic getTopicById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Topic with ID " + id + " not found"));
    }

    // Create a new topic
    public Topic createTopic(TopicDTO topicDTO) {
        Topic topic = new Topic();
        topic.setName(topicDTO.getName());
        topic.setDescription(topicDTO.getDescription());
        topic.setStatus(topicDTO.getStatus() != null ? topicDTO.getStatus() : true); // Default to active
        topic.setTrash(false); // New topics are not trashed
        topic.setCreatedAt(LocalDateTime.now());

        return topicRepository.save(topic);
    }

    // Update an existing topic
    public Topic updateTopic(Long id, TopicDTO topicDTO) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic with ID " + id + " does not exist"));

        topic.setName(topicDTO.getName() != null ? topicDTO.getName() : topic.getName());
        topic.setDescription(topicDTO.getDescription() != null ? topicDTO.getDescription() : topic.getDescription());
        topic.setStatus(topicDTO.getStatus() != null ? topicDTO.getStatus() : topic.getStatus());
        topic.setUpdatedAt(LocalDateTime.now());

        return topicRepository.save(topic);
    }

    // Hard delete a topic
    public void deleteTopic(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new RuntimeException("Topic with ID " + id + " does not exist");
        }
        topicRepository.deleteById(id);
    }

    // Toggle the status of a topic
    public Topic toggleStatus(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic with ID " + id + " does not exist"));

        topic.setStatus(!topic.getStatus());
        topic.setUpdatedAt(LocalDateTime.now());
        return topicRepository.save(topic);
    }

    // Restore a trashed topic
    public Topic restoreTopic(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic with ID " + id + " does not exist"));

        topic.setTrash(false); // Restore the topic
        topic.setUpdatedAt(LocalDateTime.now());
        return topicRepository.save(topic);
    }
}
