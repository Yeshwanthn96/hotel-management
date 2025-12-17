package com.example.hotelservice.controller;

import com.example.hotelservice.dto.HotelRequest;
import com.example.hotelservice.dto.HotelResponse;
import com.example.hotelservice.dto.HotelSearchRequest;
import com.example.hotelservice.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Hotel Service is running");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createHotel(@RequestBody HotelRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String createdBy = authentication != null ? authentication.getName() : "system";

            HotelResponse response = hotelService.createHotel(request, createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateHotel(@PathVariable String id, @RequestBody HotelRequest request) {
        try {
            HotelResponse response = hotelService.updateHotel(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getHotelById(@PathVariable String id) {
        try {
            HotelResponse response = hotelService.getHotelById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getAllHotels() {
        List<HotelResponse> hotels = hotelService.getAllHotels();
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/active")
    public ResponseEntity<List<HotelResponse>> getActiveHotels() {
        List<HotelResponse> hotels = hotelService.getActiveHotels();
        return ResponseEntity.ok(hotels);
    }

    @PostMapping("/search")
    public ResponseEntity<List<HotelResponse>> searchHotels(@RequestBody HotelSearchRequest searchRequest) {
        List<HotelResponse> hotels = hotelService.searchHotels(searchRequest);
        return ResponseEntity.ok(hotels);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHotel(@PathVariable String id) {
        try {
            hotelService.deleteHotel(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Hotel deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleHotelStatus(@PathVariable String id) {
        try {
            HotelResponse response = hotelService.toggleHotelStatus(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateHotel(@PathVariable String id) {
        try {
            HotelResponse response = hotelService.activateHotel(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateHotel(@PathVariable String id) {
        try {
            HotelResponse response = hotelService.deactivateHotel(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
