package com.example.backend.controller;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.model.Category;
import com.example.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // 1. Lấy tất cả category
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // 2. Lấy category theo ID
    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    // 3. Tạo category mới
    @PostMapping
    public Category createCategory(@RequestBody CategoryDTO dto) {
        return categoryService.createCategoryFromDTO(dto);
    }

    // 4. Cập nhật category
    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        return categoryService.updateCategory(id, dto);
    }

    // 5. Thay đổi trạng thái (true/false)
    @PutMapping("/status/{id}")
    public Category changeStatus(@PathVariable Long id) {
        return categoryService.toggleCategoryStatus(id);
    }

    // 6. Xoá tạm (vào thùng rác)
    @PutMapping("/trash/{id}")
    public Category softDeleteCategory(@PathVariable Long id) {
        return categoryService.moveToTrash(id);
    }

    // 7. Xoá khỏi database (xoá thật)
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategoryPermanently(id);
    }

    // 8. Lấy danh sách trong thùng rác
    @GetMapping("/trash")
    public List<Category> getTrashedCategories() {
        return categoryService.getTrashedCategories();
    }

    // 9. Khôi phục từ thùng rác
    @PutMapping("/restore/{id}")
    public Category restoreCategory(@PathVariable Long id) {
        return categoryService.restoreCategory(id);
    }
}
