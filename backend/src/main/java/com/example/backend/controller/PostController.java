package com.example.backend.controller;

import com.example.backend.dto.PostDTO;
import com.example.backend.model.Post;
import com.example.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostService postService;
    
    private static final String IMAGE_DIR = "uploads/posts";

    @GetMapping
    public List<Post> getAll() {
        return postService.getAll();
    }

    @GetMapping("/trash")
    public List<Post> getTrash() {
        return postService.getTrash();
    }

    @GetMapping("/{id}")
    public Post getById(@PathVariable Long id) {
        return postService.getById(id);
    }

    @GetMapping("/topic/{topicId}")
    public List<Post> getByTopic(@PathVariable Long topicId) {
        return postService.getByTopic(topicId);
    }

    @GetMapping("/search")
    public List<Post> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content) {
        return postService.search(title, content);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Post create(
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("topicId") Long topicId,
            @RequestParam(value = "status", required = false, defaultValue = "true") Boolean status) 
            throws IOException {

        PostDTO dto = new PostDTO();
        dto.setTitle(title);
        dto.setContent(content);
        dto.setTopicId(topicId);
        dto.setStatus(status);

        // Handle image if provided
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            dto.setImage(imagePath);
        }

        return postService.create(dto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Post update(
            @PathVariable Long id,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("topicId") Long topicId,
            @RequestParam(value = "status", required = false, defaultValue = "true") Boolean status) 
            throws IOException {

        PostDTO dto = new PostDTO();
        dto.setTitle(title);
        dto.setContent(content);
        dto.setTopicId(topicId);
        dto.setStatus(status);

        // Handle image if provided
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            dto.setImage(imagePath);
        }

        return postService.update(id, dto);
    }

    @PutMapping("/status/{id}")
    public Post toggleStatus(@PathVariable Long id) {
        return postService.toggleStatus(id);
    }

    @PutMapping("/trash/{id}")
    public Post softDelete(@PathVariable Long id) {
        return postService.softDelete(id);
    }

    @PutMapping("/restore/{id}")
    public Post restore(@PathVariable Long id) {
        return postService.restore(id);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }

    private String saveImage(MultipartFile image) throws IOException {
        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(IMAGE_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename to prevent overwriting
        String originalFilename = image.getOriginalFilename();
        String filename = System.currentTimeMillis() + "_" + originalFilename;

        // Save the file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(image.getInputStream(), filePath);

        return filename; // Return just the filename, not the full path
    }
}