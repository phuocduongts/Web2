package com.example.backend.service;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.model.Category;
import com.example.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findByTrashFalse();
    }

    public Category createCategoryFromDTO(CategoryDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Category already exists");
        }

        Category parent = dto.getParentId() != null
                ? categoryRepository.findById(dto.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent category not found"))
                : null;

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setStatus(dto.getStatus() != null ? dto.getStatus() : true);
        category.setTrash(false);
        category.setParent(parent);

        return categoryRepository.save(category);
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category updateCategory(Long id, CategoryDTO dto) {
        Category category = getCategoryById(id);

        Category parent = dto.getParentId() != null
                ? categoryRepository.findById(dto.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent category not found"))
                : null;

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setStatus(dto.getStatus());
        category.setParent(parent);

        return categoryRepository.save(category);
    }

    public Category toggleCategoryStatus(Long id) {
        Category category = getCategoryById(id);
        category.setStatus(!category.getStatus());
        return categoryRepository.save(category);
    }

    public Category moveToTrash(Long id) {
        Category category = getCategoryById(id);
        category.setTrash(true);
        return categoryRepository.save(category);
    }

    public void deleteCategoryPermanently(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        categoryRepository.deleteById(id);
    }

    public List<Category> getTrashedCategories() {
        return categoryRepository.findByTrashTrue();
    }

    public Category restoreCategory(Long id) {
        Category category = getCategoryById(id);
        category.setTrash(false);
        return categoryRepository.save(category);
    }
}
