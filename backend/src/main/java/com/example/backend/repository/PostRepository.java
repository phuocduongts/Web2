package com.example.backend.repository;

import com.example.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByTrashFalse();
    List<Post> findByTrashTrue();
    List<Post> findByTopicIdAndTrashFalse(Long topicId);
    List<Post> findByTitleContainingAndContentContainingAndTrashFalse(String title, String content);
    List<Post> findByTitleContainingAndTrashFalse(String title);
    List<Post> findByContentContainingAndTrashFalse(String content);
}
