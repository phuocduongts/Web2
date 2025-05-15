package com.example.backend.controller;

import com.example.backend.dto.ProductDTO;
import com.example.backend.dto.ProductSearchDTO;
import com.example.backend.model.Product;
import com.example.backend.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    private static final String IMAGE_DIR = "uploads/products";

    @GetMapping
    public List<Product> getAll() {
        return productService.getAll(); // hoặc getAllActive nếu bạn tách riêng
    }

    @GetMapping("/most-viewed")
    public List<Product> getMostViewedProducts() {
        return productService.getMostViewed();
    }

    @GetMapping("/on-sale")
    public List<Product> getOnSaleProducts() {
        return productService.getOnSaleProducts();
    }

    @GetMapping("/trash")
    public List<Product> getTrash() {
        return productService.getTrash(); // lấy sản phẩm có trash = true
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int limit,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false, defaultValue = "asc") String order) {
        
        Map<String, Object> response = productService.getByCategory(categoryId, page, limit, sort, order);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(ProductSearchDTO searchDTO) {
        Map<String, Object> response = productService.search(searchDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product create(
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "priceSale", required = false) Double priceSale,
            @RequestParam(value = "isOnSale", required = false, defaultValue = "false") Boolean isOnSale, // Đã đổi 'sale' thành 'isOnSale' và để kiểu Boolean
            @RequestParam(value = "quantity", required = false, defaultValue = "0") Integer quantity,
            @RequestParam(value = "status", required = false, defaultValue = "true") Boolean status,
            @RequestParam(value = "view", required = false, defaultValue = "0") Integer view) throws IOException {

        ProductDTO dto = new ProductDTO();
        dto.setName(name);
        dto.setDescription(description);
        dto.setPrice(price);
        dto.setCategoryId(categoryId);
        dto.setPriceSale(priceSale);
        dto.setIsOnSale(isOnSale); // Sử dụng isOnSale
        dto.setQuantity(quantity);
        dto.setStatus(status);
        dto.setView(view);

        // Handle image if provided
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            dto.setImage(imagePath);
        }

        return productService.create(dto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product update(
            @PathVariable Long id,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "priceSale", required = false) Double priceSale,
            @RequestParam(value = "isOnSale", required = false, defaultValue = "false") Boolean isOnSale, // Đã đổi 'sale' thành 'isOnSale' và để kiểu Boolean
            @RequestParam(value = "quantity", required = false, defaultValue = "0") Integer quantity,
            @RequestParam(value = "status", required = false, defaultValue = "true") Boolean status,
            @RequestParam(value = "view", required = false, defaultValue = "0") Integer view) throws IOException {

        ProductDTO dto = new ProductDTO();
        dto.setName(name);
        dto.setDescription(description);
        dto.setPrice(price);
        dto.setCategoryId(categoryId);
        dto.setPriceSale(priceSale);
        dto.setIsOnSale(isOnSale); // Sử dụng isOnSale
        dto.setQuantity(quantity);
        dto.setStatus(status);
        dto.setView(view);

        // Handle image if provided
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            dto.setImage(imagePath);
        }

        return productService.update(id, dto);
    }

    @PutMapping("/status/{id}")
    public Product toggleStatus(@PathVariable Long id) {
        return productService.toggleStatus(id);
    }

    @PutMapping("/trash/{id}")
    public Product softDelete(@PathVariable Long id) {
        return productService.softDelete(id);
    }

    @PutMapping("/restore/{id}")
    public Product restore(@PathVariable Long id) {
        return productService.restore(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    private String saveImage(MultipartFile image) throws IOException {
        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(IMAGE_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename to prevent overwriting
        String originalFilename = image.getOriginalFilename();
        String filename = System.currentTimeMillis() + "_" + originalFilename;

        // Save the file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(image.getInputStream(), filePath);

        return filename; // Return just the filename, not the full path
    }
}