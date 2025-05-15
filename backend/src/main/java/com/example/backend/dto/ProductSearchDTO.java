package com.example.backend.dto;

import java.util.Date;

/**
 * ProductSearchDTO - Used for search and filtering products
 */
public class ProductSearchDTO {
    private String q;           // Search query
    private Long category;      // Category ID
    private Double minPrice;    // Minimum price
    private Double maxPrice;    // Maximum price
    private Boolean onSale;     // Filter by on sale products
    private Integer page;       // Page number
    private Integer limit;      // Items per page
    private String sort;        // Sort field
    private String order;       // Sort direction (asc/desc)

    // Constructors
    public ProductSearchDTO() {}

    public ProductSearchDTO(String q, Long category, Double minPrice, Double maxPrice, Boolean onSale, 
                           Integer page, Integer limit, String sort, String order) {
        this.q = q;
        this.category = category;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.onSale = onSale;
        this.page = page;
        this.limit = limit;
        this.sort = sort;
        this.order = order;
    }

    // Getters & Setters
    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q;
    }

    public Long getCategory() {
        return category;
    }

    public void setCategory(Long category) {
        this.category = category;
    }

    public Double getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }

    public Boolean getOnSale() {
        return onSale;
    }

    public void setOnSale(Boolean onSale) {
        this.onSale = onSale;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }
}
