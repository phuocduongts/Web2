package com.example.backend.repository;

import com.example.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Basic queries
    List<Product> findByTrashFalse();
    Page<Product> findByTrashFalse(Pageable pageable);
    List<Product> findByTrashTrue();
    
    // Special queries
    List<Product> findByTrashFalseOrderByViewDesc();
    List<Product> findByTrashFalseAndIsOnSaleTrue();
    
    // Category related queries
    List<Product> findByCategoryIdAndTrashFalse(Long categoryId);
    Page<Product> findByCategoryIdAndTrashFalse(Long categoryId, Pageable pageable);
    
    // Search by name/description
    List<Product> findByNameContaining(String name);
    List<Product> findByDescriptionContaining(String description);
    List<Product> findByNameContainingOrDescriptionContaining(String name, String description);
    Page<Product> findByNameContainingAndTrashFalse(String name, Pageable pageable);
    
    // Combined category and search
    Page<Product> findByCategoryIdAndNameContainingAndTrashFalse(Long categoryId, String name, Pageable pageable);
    
    // Price range filters
    Page<Product> findByPriceBetweenAndTrashFalse(Double minPrice, Double maxPrice, Pageable pageable);
    Page<Product> findByPriceGreaterThanEqualAndTrashFalse(Double minPrice, Pageable pageable);
    Page<Product> findByPriceLessThanEqualAndTrashFalse(Double maxPrice, Pageable pageable);
    
    // Category with price range
    Page<Product> findByCategoryIdAndPriceBetweenAndTrashFalse(Long categoryId, Double minPrice, Double maxPrice, Pageable pageable);
    Page<Product> findByCategoryIdAndPriceGreaterThanEqualAndTrashFalse(Long categoryId, Double minPrice, Pageable pageable);
    Page<Product> findByCategoryIdAndPriceLessThanEqualAndTrashFalse(Long categoryId, Double maxPrice, Pageable pageable);
    
    // Search with price range
    Page<Product> findByNameContainingAndPriceBetweenAndTrashFalse(String name, Double minPrice, Double maxPrice, Pageable pageable);
    Page<Product> findByNameContainingAndPriceGreaterThanEqualAndTrashFalse(String name, Double minPrice, Pageable pageable);
    Page<Product> findByNameContainingAndPriceLessThanEqualAndTrashFalse(String name, Double maxPrice, Pageable pageable);
    
    // Combined all
    Page<Product> findByCategoryIdAndNameContainingAndPriceBetweenAndTrashFalse(Long categoryId, String name, Double minPrice, 
                                                                             Double maxPrice, Pageable pageable);
    Page<Product> findByCategoryIdAndNameContainingAndPriceGreaterThanEqualAndTrashFalse(Long categoryId, String name, 
                                                                                      Double minPrice, Pageable pageable);
    Page<Product> findByCategoryIdAndNameContainingAndPriceLessThanEqualAndTrashFalse(Long categoryId, String name, 
                                                                                    Double maxPrice, Pageable pageable);
}