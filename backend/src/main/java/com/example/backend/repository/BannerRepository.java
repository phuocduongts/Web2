package com.example.backend.repository;

import com.example.backend.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByTrashFalse();

    List<Banner> findByTrashTrue();
}