package com.example.backend.controller;

import com.example.backend.model.Banner;
import com.example.backend.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = "*")
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @GetMapping("/trash")
    public ResponseEntity<List<Banner>> getTrashedBanners() {
        return ResponseEntity.ok(bannerService.getTrashedBanners());
    }

    @PutMapping("/trash/{id}")
    public ResponseEntity<?> softDeleteBanner(@PathVariable Long id) {
        try {
            bannerService.softDeleteBanner(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping("/restore/{id}")
    public ResponseEntity<?> restoreBanner(@PathVariable Long id) {
        bannerService.restoreBanner(id);
        return ResponseEntity.ok("Khôi phục banner thành công!");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBannerById(@PathVariable Long id) {
        return bannerService.getBannerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> createBanner(
            @RequestParam("title") String title,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "status", required = false, defaultValue = "true") boolean status) {

        try {
            Banner banner = Banner.builder()
                    .title(title)
                    .status(status)
                    .build();
            Banner createdBanner = bannerService.createBanner(banner, image);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBanner);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create banner: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateBanner(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("status") boolean status) {

        try {
            Banner bannerDetails = Banner.builder()
                    .title(title)
                    .status(status)
                    .build();
            Banner updatedBanner = bannerService.updateBanner(id, bannerDetails, image);
            return ResponseEntity.ok(updatedBanner);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update banner: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        try {
            bannerService.deleteBanner(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        try {
            Banner banner = bannerService.toggleStatus(id);
            return ResponseEntity.ok(banner);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
