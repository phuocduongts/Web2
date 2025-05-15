package com.example.backend.service;

import com.example.backend.dto.CreateOrderRequest;
import com.example.backend.dto.OrderDTO;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Order;
import com.example.backend.model.OrderDetail;
import com.example.backend.model.Product;
import com.example.backend.model.User;
import com.example.backend.repository.OrderDetailRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Create a new order
     */
    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        // Create the order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingPhone(request.getShippingPhone());
        order.setShippingName(request.getShippingName());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("PENDING");
        order.setOrderStatus("PENDING");
        order.setNotes(request.getNotes());

        // Calculate total amount and create order details
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Product not found with id: " + item.getProductId()));

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);
            orderDetail.setProduct(product);
            orderDetail.setQuantity(item.getQuantity());

            // ✅ Chuyển Double về BigDecimal
            BigDecimal unitPrice = BigDecimal.valueOf(product.getEffectivePrice()); // dùng giá khuyến mãi nếu có
            orderDetail.setUnitPrice(unitPrice);

            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());
            BigDecimal subtotal = unitPrice.multiply(quantity);

            orderDetail.setSubtotal(subtotal);
            orderDetail.setDiscountAmount(BigDecimal.ZERO);
            orderDetail.setFinalPrice(subtotal); // nếu có giảm giá thì trừ sau

            order.addOrderDetail(orderDetail);
            totalAmount = totalAmount.add(orderDetail.getFinalPrice());
        }

        order.setTotalAmount(totalAmount);

        // Save the order (cascade will save order details)
        Order savedOrder = orderRepository.save(order);

        return new OrderDTO(savedOrder);
    }

    /**
     * Get an order by ID
     */
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return new OrderDTO(order);
    }

    /**
     * Get all orders for a user
     */
    public List<OrderDTO> getUserOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Order> orders = orderRepository.findByUserAndTrashFalse(user);
        return orders.stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Get all orders with pagination
     */
    // Thay vì trả về Page<OrderDTO>, trả về List<OrderDTO>
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    // Thay đổi phương thức searchOrders
    public List<OrderDTO> searchOrders(String searchTerm) {
        List<Order> orders = orderRepository.searchOrders(searchTerm, Pageable.unpaged()).getContent();
        return orders.stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Update order status
     */
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setOrderStatus(status);

        // Update payment status if order is delivered
        if ("DELIVERED".equals(status)) {
            order.setPaymentStatus("PAID");
        }

        Order updatedOrder = orderRepository.save(order);
        return new OrderDTO(updatedOrder);
    }

    /**
     * Update payment status
     */
    @Transactional
    public OrderDTO updatePaymentStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setPaymentStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return new OrderDTO(updatedOrder);
    }

    /**
     * Update tracking information
     */
    @Transactional
    public OrderDTO updateTrackingInfo(Long orderId, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setTrackingNumber(trackingNumber);
        order.setOrderStatus("SHIPPED");

        Order updatedOrder = orderRepository.save(order);
        return new OrderDTO(updatedOrder);
    }

    /**
     * Cancel an order
     */
    @Transactional
    public OrderDTO cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Check if order can be cancelled (not already shipped or delivered)
        if ("SHIPPED".equals(order.getOrderStatus()) || "DELIVERED".equals(order.getOrderStatus())) {
            throw new IllegalStateException("Cannot cancel order that has already been shipped or delivered");
        }

        order.setOrderStatus("CANCELLED");
        Order updatedOrder = orderRepository.save(order);
        return new OrderDTO(updatedOrder);
    }

    /**
     * Soft delete (move to trash) an order
     */
    @Transactional
    public void moveOrderToTrash(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setTrash(true);
        orderRepository.save(order);
    }

    /**
     * Restore an order from trash
     */
    @Transactional
    public void restoreOrderFromTrash(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setTrash(false);
        orderRepository.save(order);
    }

    /**
     * Get recent orders
     */
    public List<OrderDTO> getRecentOrders(int limit) {
        Pageable pageable = Pageable.ofSize(limit);
        List<Order> orders = orderRepository.findRecentOrders(pageable);
        return orders.stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Count orders by status
     */
    public long countOrdersByStatus(String status) {
        return orderRepository.countByOrderStatus(status);
    }
}