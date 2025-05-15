package com.example.backend.service;

import com.example.backend.dto.ProductDTO;
import com.example.backend.dto.ProductSearchDTO;
import com.example.backend.model.Category;
import com.example.backend.model.Product;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private CategoryRepository categoryRepo;

    public List<Product> getAll() {
        return productRepo.findByTrashFalse(); // Only fetch active products
    }

    public Map<String, Object> getAllWithPagination(int page, int limit, String sortField, String sortDir) {
        Sort sort = sortField != null && !sortField.isEmpty()
                ? Sort.by(sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortField)
                : Sort.by(Sort.Direction.DESC, "id");

        Pageable pageable = PageRequest.of(page - 1, limit, sort);
        Page<Product> productPage = productRepo.findByTrashFalse(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("products", productPage.getContent());
        response.put("total", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("currentPage", page);

        return response;
    }

    public List<Product> getMostViewed() {
        return productRepo.findByTrashFalseOrderByViewDesc();
    }

    public List<Product> getOnSaleProducts() {
        return productRepo.findByTrashFalseAndIsOnSaleTrue(); // Fetch products not trashed and on sale
    }

    public Product getById(Long id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> getTrash() {
        return productRepo.findByTrashTrue();
    }

    public Map<String, Object> getByCategory(Long categoryId, int page, int limit, String sortField, String sortDir) {
        Sort sort = sortField != null && !sortField.isEmpty()
                ? Sort.by(sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortField)
                : Sort.by(Sort.Direction.DESC, "id");

        Pageable pageable = PageRequest.of(page - 1, limit, sort);
        Page<Product> productPage = productRepo.findByCategoryIdAndTrashFalse(categoryId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("products", productPage.getContent());
        response.put("total", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("currentPage", page);

        return response;
    }

    public Product create(ProductDTO dto) {
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : true);
        product.setTrash(false);
        product.setCategory(category);
        product.setPriceSale(dto.getPriceSale());
        product.setIsOnSale(dto.getIsOnSale() != null ? dto.getIsOnSale() : false);
        product.setQuantity(dto.getQuantity());
        product.setView(dto.getView() != null ? dto.getView() : 0);
        product.setImage(dto.getImage());

        return productRepo.save(product);
    }

    public Product update(Long id, ProductDTO dto) {
        Product product = getById(id);
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : product.getStatus());
        product.setCategory(category);
        product.setPriceSale(dto.getPriceSale());
        product.setIsOnSale(dto.getIsOnSale() != null ? dto.getIsOnSale() : product.getIsOnSale());
        product.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : product.getQuantity());
        product.setView(dto.getView() != null ? dto.getView() : product.getView());
        product.setImage(dto.getImage() != null ? dto.getImage() : product.getImage());

        return productRepo.save(product);
    }

    public Product toggleStatus(Long id) {
        Product product = getById(id);
        product.setStatus(!product.getStatus());
        return productRepo.save(product);
    }

    public Product softDelete(Long id) {
        Product product = getById(id);
        product.setTrash(true);
        return productRepo.save(product);
    }

    public Product restore(Long id) {
        Product product = getById(id);
        product.setTrash(false);
        return productRepo.save(product);
    }

    public void delete(Long id) {
        productRepo.deleteById(id);
    }

    public Map<String, Object> search(ProductSearchDTO searchDTO) {
        int page = searchDTO.getPage() != null ? searchDTO.getPage() : 1;
        int limit = searchDTO.getLimit() != null ? searchDTO.getLimit() : 10;

        String sortField = "id";
        String sortDir = "desc";

        if (searchDTO.getSort() != null && !searchDTO.getSort().isEmpty()) {
            sortField = searchDTO.getSort();
            sortDir = searchDTO.getOrder() != null ? searchDTO.getOrder() : "asc";
        }

        Sort sort = Sort.by(sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortField);
        Pageable pageable = PageRequest.of(page - 1, limit, sort);

        Page<Product> productPage;

        // Lọc theo tất cả các điều kiện
        if (searchDTO.getQ() != null && !searchDTO.getQ().isEmpty()) {
            String searchTerm = searchDTO.getQ();

            if (searchDTO.getCategory() != null) {
                // Tìm kiếm theo danh mục và từ khóa
                Long categoryId = searchDTO.getCategory();

                if (searchDTO.getMinPrice() != null && searchDTO.getMaxPrice() != null) {
                    // Tìm theo danh mục, từ khóa và khoảng giá
                    productPage = productRepo.findByCategoryIdAndNameContainingAndPriceBetweenAndTrashFalse(
                            categoryId, searchTerm, searchDTO.getMinPrice(), searchDTO.getMaxPrice(), pageable);
                } else if (searchDTO.getMinPrice() != null) {
                    // Tìm theo danh mục, từ khóa và giá tối thiểu
                    productPage = productRepo.findByCategoryIdAndNameContainingAndPriceGreaterThanEqualAndTrashFalse(
                            categoryId, searchTerm, searchDTO.getMinPrice(), pageable);
                } else if (searchDTO.getMaxPrice() != null) {
                    // Tìm theo danh mục, từ khóa và giá tối đa
                    productPage = productRepo.findByCategoryIdAndNameContainingAndPriceLessThanEqualAndTrashFalse(
                            categoryId, searchTerm, searchDTO.getMaxPrice(), pageable);
                } else {
                    // Tìm theo danh mục và từ khóa
                    productPage = productRepo.findByCategoryIdAndNameContainingAndTrashFalse(
                            categoryId, searchTerm, pageable);
                }
            } else {
                // Tìm kiếm theo từ khóa không có danh mục
                if (searchDTO.getMinPrice() != null && searchDTO.getMaxPrice() != null) {
                    // Tìm theo từ khóa và khoảng giá
                    productPage = productRepo.findByNameContainingAndPriceBetweenAndTrashFalse(
                            searchTerm, searchDTO.getMinPrice(), searchDTO.getMaxPrice(), pageable);
                } else if (searchDTO.getMinPrice() != null) {
                    // Tìm theo từ khóa và giá tối thiểu
                    productPage = productRepo.findByNameContainingAndPriceGreaterThanEqualAndTrashFalse(
                            searchTerm, searchDTO.getMinPrice(), pageable);
                } else if (searchDTO.getMaxPrice() != null) {
                    // Tìm theo từ khóa và giá tối đa
                    productPage = productRepo.findByNameContainingAndPriceLessThanEqualAndTrashFalse(
                            searchTerm, searchDTO.getMaxPrice(), pageable);
                } else {
                    // Chỉ tìm theo từ khóa
                    productPage = productRepo.findByNameContainingAndTrashFalse(searchTerm, pageable);
                }
            }
        } else {
            // Không có từ khóa tìm kiếm
            if (searchDTO.getCategory() != null) {
                // Lọc theo danh mục
                Long categoryId = searchDTO.getCategory();

                if (searchDTO.getMinPrice() != null && searchDTO.getMaxPrice() != null) {
                    // Lọc theo danh mục và khoảng giá
                    productPage = productRepo.findByCategoryIdAndPriceBetweenAndTrashFalse(
                            categoryId, searchDTO.getMinPrice(), searchDTO.getMaxPrice(), pageable);
                } else if (searchDTO.getMinPrice() != null) {
                    // Lọc theo danh mục và giá tối thiểu
                    productPage = productRepo.findByCategoryIdAndPriceGreaterThanEqualAndTrashFalse(
                            categoryId, searchDTO.getMinPrice(), pageable);
                } else if (searchDTO.getMaxPrice() != null) {
                    // Lọc theo danh mục và giá tối đa
                    productPage = productRepo.findByCategoryIdAndPriceLessThanEqualAndTrashFalse(
                            categoryId, searchDTO.getMaxPrice(), pageable);
                } else {
                    // Chỉ lọc theo danh mục
                    productPage = productRepo.findByCategoryIdAndTrashFalse(categoryId, pageable);
                }
            } else {
                // Không có danh mục
                if (searchDTO.getMinPrice() != null && searchDTO.getMaxPrice() != null) {
                    // Lọc theo khoảng giá
                    productPage = productRepo.findByPriceBetweenAndTrashFalse(
                            searchDTO.getMinPrice(), searchDTO.getMaxPrice(), pageable);
                } else if (searchDTO.getMinPrice() != null) {
                    // Lọc theo giá tối thiểu
                    productPage = productRepo.findByPriceGreaterThanEqualAndTrashFalse(
                            searchDTO.getMinPrice(), pageable);
                } else if (searchDTO.getMaxPrice() != null) {
                    // Lọc theo giá tối đa
                    productPage = productRepo.findByPriceLessThanEqualAndTrashFalse(
                            searchDTO.getMaxPrice(), pageable);
                } else {
                    // Không có bộ lọc nào
                    productPage = productRepo.findByTrashFalse(pageable);
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("products", productPage.getContent());
        response.put("total", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("currentPage", page);

        return response;
    }
}