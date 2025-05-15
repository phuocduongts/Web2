package com.example.backend.repository;

import com.example.backend.model.Category;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
    List<Category> findByTrashTrue();
    List<Category> findByTrashFalse();
}
