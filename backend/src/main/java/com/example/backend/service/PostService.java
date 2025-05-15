package com.example.backend.service;

import com.example.backend.dto.PostDTO;
import com.example.backend.model.Post;
import com.example.backend.model.Topic;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private TopicRepository topicRepository;

    public List<Post> getAll() {
        return postRepository.findByTrashFalse();
    }

    public List<Post> getTrash() {
        return postRepository.findByTrashTrue();
    }

    public Post getById(Long id) {
        return postRepository.findById(id).orElse(null);
    }

    public List<Post> getByTopic(Long topicId) {
        return postRepository.findByTopicIdAndTrashFalse(topicId);
    }

    public List<Post> search(String title, String content) {
        if (title != null && content != null) {
            return postRepository.findByTitleContainingAndContentContainingAndTrashFalse(title, content);
        } else if (title != null) {
            return postRepository.findByTitleContainingAndTrashFalse(title);
        } else if (content != null) {
            return postRepository.findByContentContainingAndTrashFalse(content);
        } else {
            return getAll();
        }
    }

    public Post create(PostDTO dto) {
        Post post = new Post();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setStatus(dto.getStatus() != null ? dto.getStatus() : true);
        post.setTrash(false);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        if (dto.getImage() != null) {
            post.setImage(dto.getImage());
        }

        if (dto.getTopicId() != null) {
            Topic topic = topicRepository.findById(dto.getTopicId()).orElse(null);
            post.setTopic(topic);
        }

        return postRepository.save(post);
    }

    public Post update(Long id, PostDTO dto) {
        Optional<Post> optional = postRepository.findById(id);
        if (optional.isEmpty()) return null;

        Post post = optional.get();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setStatus(dto.getStatus());
        post.setUpdatedAt(LocalDateTime.now());

        if (dto.getTopicId() != null) {
            Topic topic = topicRepository.findById(dto.getTopicId()).orElse(null);
            post.setTopic(topic);
        }

        if (dto.getImage() != null) {
            post.setImage(dto.getImage());
        }

        return postRepository.save(post);
    }

    public Post toggleStatus(Long id) {
        Optional<Post> optional = postRepository.findById(id);
        if (optional.isEmpty()) return null;

        Post post = optional.get();
        post.setStatus(!post.getStatus());
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Post softDelete(Long id) {
        Optional<Post> optional = postRepository.findById(id);
        if (optional.isEmpty()) return null;

        Post post = optional.get();
        post.setTrash(true);
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Post restore(Long id) {
        Optional<Post> optional = postRepository.findById(id);
        if (optional.isEmpty()) return null;
        Post post = optional.get();
        post.setTrash(false);
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public void delete(Long id) {
        postRepository.deleteById(id);
    }
}