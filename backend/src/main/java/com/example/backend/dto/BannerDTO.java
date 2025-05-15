package com.example.backend.dto;

import java.time.LocalDateTime;

public class BannerDTO {

    private Long id;          // Thêm ID nếu cần truyền thông tin của banner
    private String title;
    private String link;
    private Boolean status;
    private String image;
    private Boolean trash;    // Thêm trường trash để biết banner có trong thùng rác hay không
    private LocalDateTime createdAt;   // Thêm thông tin ngày tạo
    private LocalDateTime updatedAt;   // Thêm thông tin ngày cập nhật

    // Constructor mặc định
    public BannerDTO() {}

    // Getter và Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Boolean getTrash() {
        return trash;
    }

    public void setTrash(Boolean trash) {
        this.trash = trash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
