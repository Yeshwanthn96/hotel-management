package com.example.userservice.controller;

import com.example.userservice.dto.*;
import com.example.userservice.service.AuthService;
import com.example.userservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String email = jwtUtil.extractEmail(token);

            UserProfileResponse profile = authService.getProfile(email);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateProfileRequest request) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            UserProfileResponse profile = authService.updateProfile(email, request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            // Get user profile to check role
            UserProfileResponse userProfile = authService.getProfile(email);

            // Only admin can view all users
            if (!"admin".equals(userProfile.getRole())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            Map<String, Object> users = authService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            if (jwtUtil.validateToken(token, email)) {
                UserProfileResponse profile = authService.getProfile(email);
                return ResponseEntity.ok(profile);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
