package com.example.backend.service;

import com.example.backend.model.Cart;
import com.example.backend.model.Product;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import com.example.backend.model.User;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Cart> getCartItemsForUser(User user) {
        return cartRepository.findByUserIdAndActiveTrue(user.getId());
    }

    // Lấy giỏ hàng của người dùng
    public List<Cart> getCartByUser(Long userId) {
        return cartRepository.findByUserIdAndActiveTrue(userId);
    }

    // Thêm sản phẩm vào giỏ
    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        Optional<Cart> existingCart = cartRepository.findByUserIdAndProductIdAndActiveTrue(userId, productId);
        if (existingCart.isPresent()) {
            Cart cart = existingCart.get();
            cart.setQuantity(cart.getQuantity() + quantity);
            return cartRepository.save(cart);
        } else {
            // Lấy đối tượng User và Product từ repository
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Cart cart = new Cart();
            cart.setUser(user); // Không truyền userId
            cart.setProduct(product); // Không truyền productId
            cart.setQuantity(quantity);
            return cartRepository.save(cart);
        }
    }

    public boolean isProductInCart(Long userId, Long productId) {
        return cartRepository.existsByUserIdAndProductIdAndTrashFalse(userId, productId);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public void deleteFromCart(Long cartId) {
        cartRepository.deleteById(cartId);
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    public Cart updateQuantity(Long cartId, Integer quantity) {
        Optional<Cart> cartOptional = cartRepository.findById(cartId);
        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            cart.setQuantity(quantity);
            return cartRepository.save(cart);
        }
        return null;
    }

    // Xóa sản phẩm khỏi giỏ (thùng rác)
    public void softDeleteFromCart(Long cartId) {
        Optional<Cart> cartOptional = cartRepository.findById(cartId);
        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            cart.setActive(false); // Đánh dấu là không hoạt động
            cartRepository.save(cart);
        }
    }

    public int countTotalItemsInCart(Long userId) {
        Integer total = cartRepository.countTotalQuantityByUserId(userId);
        return (total != null) ? total : 0;
    }

    // Xoá toàn bộ sản phẩm trong giỏ hàng của người dùng
    public void clearCartByUser(Long userId) {
        List<Cart> carts = cartRepository.findByUserIdAndActiveTrue(userId);
        for (Cart cart : carts) {
            cart.setActive(false); // Soft delete
        }
        cartRepository.saveAll(carts);
    }

}
