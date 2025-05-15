package com.example.backend.repository;

import com.example.backend.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByEmailAndToken(String email, String token);
    Optional<VerificationToken> findByEmail(String email);
}