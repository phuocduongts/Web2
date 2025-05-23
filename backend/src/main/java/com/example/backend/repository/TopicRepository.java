package com.example.backend.repository;

import com.example.backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByTrashFalse();
    List<Topic> findByTrashTrue();
}
