package com.example.backend.dto;

public class ProductDTO {
    private String name;
    private String description;
    private Double price;
    private Boolean status;
    private Long categoryId;
    private Double priceSale;
    private Boolean isOnSale; // Updated to match `isOnSale`
    private Integer quantity;
    private Integer view;
    private String image;

    // Constructors
    public ProductDTO() {}

    public ProductDTO(String name, String description, Double price, Boolean status, Long categoryId,
                      Double priceSale, Boolean isOnSale, Integer quantity, Integer view, String image) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.status = status;
        this.categoryId = categoryId;
        this.priceSale = priceSale;
        this.isOnSale = isOnSale;
        this.quantity = quantity;
        this.view = view;
        this.image = image;
    }

    // Getters & Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Double getPriceSale() {
        return priceSale;
    }

    public void setPriceSale(Double priceSale) {
        this.priceSale = priceSale;
    }

    public Boolean getIsOnSale() {
        return isOnSale;
    }

    public void setIsOnSale(Boolean isOnSale) {
        this.isOnSale = isOnSale;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getView() {
        return view;
    }

    public void setView(Integer view) {
        this.view = view;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
