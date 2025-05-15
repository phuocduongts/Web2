package com.example.backend.controller;

import com.example.backend.dto.CartRequest;
import com.example.backend.model.Cart;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // Kiểm tra sản phẩm có trong giỏ không
    @GetMapping("/check-product")
    public ResponseEntity<Boolean> checkProductInCart(@RequestParam Long userId, @RequestParam Long productId) {
        boolean exists = cartService.isProductInCart(userId, productId);
        return ResponseEntity.ok(exists);
    }

    // Lấy giỏ hàng của người dùng
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Cart>> getCartByUser(@PathVariable Long userId) {
        List<Cart> carts = cartService.getCartByUser(userId);
        return ResponseEntity.ok(carts);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartRequest request) {
        Long userId = request.getUserId();
        Long productId = request.getProductId();
        int quantity = request.getQuantity();

        // Gọi service để xử lý logic thêm sản phẩm vào giỏ hàng
        cartService.addToCart(userId, productId, quantity);

        return ResponseEntity.ok("Thêm vào giỏ hàng thành công");
    }

    // Cập nhật số lượng sản phẩm trong giỏ
    @PutMapping("/update/{cartId}")
    public ResponseEntity<Cart> updateQuantity(@PathVariable Long cartId, @RequestParam Integer quantity) {
        Cart updatedCart = cartService.updateQuantity(cartId, quantity);
        return updatedCart != null ? ResponseEntity.ok(updatedCart) : ResponseEntity.notFound().build();
    }

    // Xóa sản phẩm khỏi giỏ
    @DeleteMapping("/delete/{cartId}")
    public ResponseEntity<Void> deleteFromCart(@PathVariable Long cartId) {
        cartService.deleteFromCart(cartId);
        return ResponseEntity.noContent().build();
    }

    // Xóa sản phẩm khỏi giỏ (soft delete)
    @PutMapping("/softDelete/{cartId}")
    public ResponseEntity<Void> softDeleteFromCart(@PathVariable Long cartId) {
        cartService.softDeleteFromCart(cartId);
        return ResponseEntity.noContent().build();
    }

    // CartController.java
    @GetMapping("/count/{userId}")
    public ResponseEntity<Integer> countCartItems(@PathVariable Long userId) {
        int totalItems = cartService.countTotalItemsInCart(userId);
        return ResponseEntity.ok(totalItems);
    }

    // Xoá toàn bộ sản phẩm trong giỏ hàng theo userId
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        cartService.clearCartByUser(userId);
        return ResponseEntity.ok().build();
    }
}
