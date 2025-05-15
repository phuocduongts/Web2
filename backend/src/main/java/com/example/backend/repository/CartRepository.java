package com.example.backend.repository;

import com.example.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    List<Cart> findByUserIdAndActiveTrue(Long userId);

    Optional<Cart> findByUserIdAndProductIdAndActiveTrue(Long userId, Long productId);

    boolean existsByUserIdAndProductIdAndTrashFalse(Long userId, Long productId);

    // CartRepository.java
    @Query("SELECT SUM(c.quantity) FROM Cart c WHERE c.user.id = :userId AND c.active = true")
    Integer countTotalQuantityByUserId(@Param("userId") Long userId);

}
