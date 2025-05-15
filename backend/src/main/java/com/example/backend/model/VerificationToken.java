package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String token;
    private LocalDateTime expiryDate;
    private boolean used;
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}