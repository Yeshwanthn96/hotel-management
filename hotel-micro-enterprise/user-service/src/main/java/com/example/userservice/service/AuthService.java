package com.example.userservice.service;

import com.example.userservice.dto.*;
import com.example.userservice.model.User;
import com.example.userservice.repository.UserRepository;
import com.example.userservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getUsername());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new RuntimeException("User account is disabled");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName());

        return new LoginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName());
    }

    public RegisterResponse register(RegisterRequest request) {
        // Validate email format
        if (!isValidEmail(request.getEmail())) {
            throw new RuntimeException("Invalid email format");
        }

        // Validate password strength
        if (!isValidPassword(request.getPassword())) {
            throw new RuntimeException(
                    "Password must be at least 8 characters, contain uppercase, lowercase, number, and special character");
        }

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setId(String.valueOf(System.currentTimeMillis()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER"); // Default role
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return new RegisterResponse(
                "Registration successful",
                user.getEmail(),
                user.getRole());
    }

    public UserProfileResponse getProfile(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive());
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive());
    }

    public Map<String, Object> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("total", userRepository.count());
        response.put("users", userRepository.findAll());
        return response;
    }

    public Map<String, String> forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with this email");
        }

        User user = userOpt.get();

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Token valid for 1 hour
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // In production, send email with reset token
        // For demo, return the token
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset token generated");
        response.put("resetToken", resetToken);
        response.put("email", email);
        response.put("note", "In production, this would be sent via email");
        return response;
    }

    public Map<String, String> resetPassword(String email, String resetToken, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        // Validate reset token
        if (user.getResetToken() == null || !user.getResetToken().equals(resetToken)) {
            throw new RuntimeException("Invalid reset token");
        }

        // Check if token expired
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Validate new password
        if (!isValidPassword(newPassword)) {
            throw new RuntimeException(
                    "Password must be at least 8 characters, contain uppercase, lowercase, number, and special character");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful");
        return response;
    }

    public Map<String, String> changePassword(String email, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password
        if (!isValidPassword(newPassword)) {
            throw new RuntimeException(
                    "Password must be at least 8 characters, contain uppercase, lowercase, number, and special character");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return response;
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(email).matches();
    }

    private boolean isValidPassword(String password) {
        // At least 8 characters, one uppercase, one lowercase, one number, one special
        // character
        if (password == null || password.length() < 8) {
            return false;
        }
        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c))
                hasUpper = true;
            else if (Character.isLowerCase(c))
                hasLower = true;
            else if (Character.isDigit(c))
                hasDigit = true;
            else
                hasSpecial = true;
        }
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
