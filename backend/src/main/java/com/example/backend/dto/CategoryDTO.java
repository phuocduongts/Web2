package com.example.backend.dto;

public class CategoryDTO {
    private String name;
    private String description;
    private Boolean status;
    private Long parentId;

    // Constructors
    public CategoryDTO() {}

    public CategoryDTO(String name, String description, Boolean status, Long parentId) {
        this.name = name;
        this.description = description;
        this.status = status;
        this.parentId = parentId;
    }

    // Getters & Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}
