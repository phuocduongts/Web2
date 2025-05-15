package com.example.backend.service;

import com.example.backend.dto.UserDTO;
import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.ForgotPasswordDTO;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.ResetPasswordDTO;
import com.example.backend.model.User;
import com.example.backend.model.VerificationToken;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VerificationTokenRepository;
import com.example.backend.security.JwtUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    public String authenticateAdmin(String username, String password) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid username or password");
        }

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new Exception("Access denied: not an admin");
        }

        UserDetails userDetails = loadUserByUsername(username);
        return jwtUtils.generateToken(userDetails);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>());
    }

    // Add this method to match what's called in UserController
    public UserDTO createUser(UserDTO userDTO) throws Exception {
        User user = create(userDTO);
        return convertToDTO(user);
    }

    public User create(UserDTO userDTO) throws Exception {
        // Check if username exists
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new Exception("Username is already taken");
        }

        // Check if email exists
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new Exception("Email is already in use");
        }

        // Create new user
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Assuming the password comes from the DTO
        user.setEmail(userDTO.getEmail());
        user.setFullName(userDTO.getFullName());
        user.setPhone(userDTO.getPhone());
        user.setAddress(userDTO.getAddress());
        user.setGender(userDTO.getGender());
        user.setRole("USER"); // Default role
        user.setStatus(true);
        user.setTrash(false);

        // Handle image if provided
        if (userDTO.getImage() != null && !userDTO.getImage().isEmpty()) {
            user.setImage(userDTO.getImage());
        }

        // Save and return the user
        return userRepository.save(user);
    }

    public User register(RegisterRequest registerRequest) throws Exception {
        // Check if username exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new Exception("Username is already taken");
        }

        // Check if email exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new Exception("Email is already in use");
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setFullName(registerRequest.getFullName());
        user.setPhone(registerRequest.getPhone());
        user.setAddress(registerRequest.getAddress());
        user.setGender(registerRequest.getGender());
        user.setRole("USER"); // Default role
        user.setStatus(true);
        user.setTrash(false);

        return userRepository.save(user);
    }

    public boolean changePassword(Long userId, ChangePasswordRequest request) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Check if old password matches
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new Exception("Current password is incorrect");
        }

        // Update with new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return true;
    }

    public UserDTO getUserById(Long id) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found"));

        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        // Only return users that are not in trash
        return userRepository.findByTrash(false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getTrashUsers() {
        // Only return users that are in trash
        return userRepository.findByTrash(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found"));

        // Only update non-sensitive fields
        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }

        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }

        if (userDTO.getAddress() != null) {
            user.setAddress(userDTO.getAddress());
        }

        if (userDTO.getGender() != null) {
            user.setGender(userDTO.getGender());
        }

        if (userDTO.getImage() != null) {
            user.setImage(userDTO.getImage());
        }

        // Only admins should be able to change these
        if (userDTO.getRole() != null) {
            user.setRole(userDTO.getRole());
        }

        if (userDTO.getStatus() != null) {
            user.setStatus(userDTO.getStatus());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public boolean deleteUser(Long id) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found"));

        // Soft delete - set trash flag to true
        user.setTrash(true);
        userRepository.save(user);

        return true;
    }

    public boolean restoreUser(Long id) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found"));

        // Restore user from trash
        if (!user.isTrash()) {
            throw new Exception("User is not in trash");
        }

        user.setTrash(false);
        userRepository.save(user);

        return true;
    }

    public boolean permanentDeleteUser(Long id) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found"));

        // Only permanently delete if user is already in trash
        if (!user.isTrash()) {
            throw new Exception("Cannot permanently delete active user. Move to trash first.");
        }

        userRepository.delete(user);
        return true;
    }

    public boolean emptyTrash() {
        List<User> trashUsers = userRepository.findByTrash(true);
        userRepository.deleteAll(trashUsers);
        return true;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    // Helper method to convert User entity to UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setGender(user.getGender());
        dto.setImage(user.getImage());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setTrash(user.isTrash());
        // Add createdAt and updatedAt fields to the DTO
        // dto.setCreatedAt(user.getCreatedAt());
        // dto.setUpdatedAt(user.getUpdatedAt());

        return dto;
    }

    public UserDTO login(String username, String password) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid password");
        }

        if (!user.getRole().equalsIgnoreCase("ADMIN")) {
            throw new Exception("Access denied. Admin only.");
        }

        if (!user.getStatus()) {
            throw new Exception("Account is inactive");
        }

        return convertToDTO(user);
    }

    public void sendPasswordResetCode(ForgotPasswordDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Email không tồn tại trong hệ thống"));
        // Tạo mã xác thực 6 số
        String verificationCode = generateVerificationCode();
        // Lưu mã xác thực vào DB
        VerificationToken token = tokenRepository.findByEmail(dto.getEmail())
                .orElse(new VerificationToken());
        token.setEmail(dto.getEmail());
        token.setToken(verificationCode);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        token.setUsed(false);
        tokenRepository.save(token);
        // Gửi email
        emailService.sendVerificationEmail(dto.getEmail(), verificationCode);
    }

    public void resetPassword(ResetPasswordDTO dto) {
        // Tìm token
        VerificationToken token = tokenRepository.findByEmailAndToken(dto.getEmail(), dto.getVerificationCode())
                .orElseThrow(() -> new IllegalArgumentException("Mã xác thực không hợp lệ"));

        // Kiểm tra token còn hiệu lực không
        if (token.isExpired()) {
            throw new IllegalArgumentException("Mã xác thực đã hết hạn");
        }

        if (token.isUsed()) {
            throw new IllegalArgumentException("Mã xác thực đã được sử dụng");
        }

        // Validate mật khẩu mới
        if (!dto.getNewPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{6,}$")) {
            throw new IllegalArgumentException(
                    "Password phải có ít nhất 6 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
        }

        // Cập nhật mật khẩu
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Email không tồn tại"));

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        token.setUsed(true);
        tokenRepository.save(token);
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Tạo số ngẫu nhiên 6 chữ số
        return String.valueOf(code);
    }

}