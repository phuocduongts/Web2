package com.example.backend.service;

import com.example.backend.model.Banner;
import com.example.backend.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    private static final String IMAGE_DIR = "uploads/banners";

    public List<Banner> getAllBanners() {
        return bannerRepository.findByTrashFalse();
    }

    public List<Banner> getTrashedBanners() {
        return bannerRepository.findByTrashTrue();
    }

    public void softDeleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner không tồn tại"));

        banner.setTrash(true);
        banner.setUpdatedAt(LocalDateTime.now());
        bannerRepository.save(banner);
    }

    public Optional<Banner> getBannerById(Long id) {
        return bannerRepository.findById(id);
    }

    public Banner createBanner(Banner banner, MultipartFile image) throws IOException {
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            banner.setImage(imagePath);
        }

        banner.setCreatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner bannerDetails, MultipartFile image) throws IOException {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner không tồn tại"));

        banner.setTitle(bannerDetails.getTitle());
        banner.setStatus(bannerDetails.isStatus());

        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            banner.setImage(imagePath);
        }
        banner.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    public void restoreBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner không tồn tại"));
        banner.setTrash(false);
        banner.setUpdatedAt(LocalDateTime.now());
        bannerRepository.save(banner);
    }

    public Banner toggleStatus(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner không tồn tại"));

        banner.setStatus(!banner.isStatus());
        return bannerRepository.save(banner);
    }

    private String saveImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            return null;
        }
        Path uploadPath = Paths.get(IMAGE_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String originalFilename = image.getOriginalFilename();
        String filename = System.currentTimeMillis() + "_" + originalFilename;
        Path filePath = uploadPath.resolve(filename);
        Files.copy(image.getInputStream(), filePath);
        return filename;
    }
}
