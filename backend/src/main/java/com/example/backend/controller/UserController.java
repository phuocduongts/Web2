package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    private static final String IMAGE_DIR = "uploads/users";

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody LoginRequest request) {
        try {
            String token = userService.authenticateAdmin(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(new ApiResponse(true, "Login successful", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserDTO userDTO = userService.getUserById(id);
            return ResponseEntity.ok(new ApiResponse(true, "User retrieved successfully", userDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(new ApiResponse(true, "Users retrieved successfully", users));
    }

    @GetMapping("/trash")
    public ResponseEntity<?> getTrashUsers() {
        List<UserDTO> users = userService.getTrashUsers();
        return ResponseEntity.ok(new ApiResponse(true, "Trash users retrieved successfully", users));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestPart("user") UserDTO userDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            if (image != null && !image.isEmpty()) {
                String imagePath = saveImage(image);
                userDTO.setImage(imagePath);
            }
            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.ok(new ApiResponse(true, "User created successfully", createdUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
            @RequestPart("user") UserDTO userDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            if (image != null && !image.isEmpty()) {
                String imagePath = saveImage(image);
                userDTO.setImage(imagePath);
            }
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(new ApiResponse(true, "User updated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/trash/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            boolean deleted = userService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse(true, "User moved to trash successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/restore/{id}")
    public ResponseEntity<?> restoreUser(@PathVariable Long id) {
        try {
            boolean restored = userService.restoreUser(id);
            return ResponseEntity.ok(new ApiResponse(true, "User restored successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> permanentDeleteUser(@PathVariable Long id) {
        try {
            boolean deleted = userService.permanentDeleteUser(id);
            return ResponseEntity.ok(new ApiResponse(true, "User permanently deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/trash/empty")
    public ResponseEntity<?> emptyTrash() {
        try {
            boolean emptied = userService.emptyTrash();
            return ResponseEntity.ok(new ApiResponse(true, "Trash emptied successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        try {
            boolean changed = userService.changePassword(id, request);
            return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
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