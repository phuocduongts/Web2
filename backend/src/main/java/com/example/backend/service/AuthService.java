package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Authenticate user and generate token
     */
    public AuthResponse login(LoginRequest loginRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

        } catch (BadCredentialsException e) {
            throw new Exception("Invalid username or password");
        }

        final UserDetails userDetails = userService.loadUserByUsername(loginRequest.getUsername());
        final User user = userService.findByUsername(loginRequest.getUsername());
        final String token = jwtUtils.generateToken(userDetails);

        // Convert user to DTO to avoid sending sensitive information
        UserDTO userDTO = convertToDTO(user);

        return new AuthResponse(token, userDTO);
    }

    /**
     * Register new user
     */
    public AuthResponse register(RegisterRequest registerRequest) throws Exception {
        // Register the user
        User user = userService.register(registerRequest);

        // Generate JWT token
        final UserDetails userDetails = userService.loadUserByUsername(user.getUsername());
        final String token = jwtUtils.generateToken(userDetails);

        // Convert user to DTO
        UserDTO userDTO = convertToDTO(user);

        return new AuthResponse(token, userDTO);
    }

    /**
     * Get user information
     */
    public UserDTO getUserInfo(String username) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        return convertToDTO(user);
    }

    /**
     * Update user account information
     */
    public UserDTO updateUserInfo(String username, UserDTO userDTO) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        // Update only allowed fields
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

        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(user.getEmail())) {
            // Check if email exists for another user
            if (userRepository.existsByEmailAndUsernameNot(userDTO.getEmail(), username)) {
                throw new Exception("Email is already in use");
            }
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getImage() != null) {
            user.setImage(userDTO.getImage());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    /**
     * Change user password
     */
    public boolean changePassword(String username, ChangePasswordRequest request) throws Exception {
        User user = userRepository.findByUsername(username)
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
        return dto;
    }
}