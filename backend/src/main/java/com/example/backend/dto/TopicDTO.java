package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class TopicDTO {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private Boolean status;

    // Default constructor
    public TopicDTO() {}

    // All-args constructor
    public TopicDTO(String name, String description, Boolean status) {
        this.name = name;
        this.description = description;
        this.status = status;
    }

    // Getters and Setters
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
}
