package com.example.hotelservice.controller;

import com.example.hotelservice.dto.RoomRequest;
import com.example.hotelservice.dto.RoomResponse;
import com.example.hotelservice.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody RoomRequest request) {
        try {
            RoomResponse response = roomService.createRoom(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable String id, @RequestBody RoomRequest request) {
        try {
            RoomResponse response = roomService.updateRoom(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable String id) {
        try {
            RoomResponse response = roomService.getRoomById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        List<RoomResponse> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByHotelId(@PathVariable String hotelId) {
        List<RoomResponse> rooms = roomService.getRoomsByHotelId(hotelId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/hotel/{hotelId}/available")
    public ResponseEntity<List<RoomResponse>> getAvailableRoomsByHotelId(@PathVariable String hotelId) {
        List<RoomResponse> rooms = roomService.getAvailableRoomsByHotelId(hotelId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/hotel/{hotelId}/search")
    public ResponseEntity<List<RoomResponse>> searchRooms(
            @PathVariable String hotelId,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        List<RoomResponse> rooms = roomService.searchRooms(hotelId, capacity, checkIn, checkOut);
        return ResponseEntity.ok(rooms);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable String id) {
        try {
            roomService.deleteRoom(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Room deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PatchMapping("/{id}/toggle-availability")
    public ResponseEntity<?> toggleRoomAvailability(@PathVariable String id) {
        try {
            RoomResponse response = roomService.toggleRoomAvailability(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PatchMapping("/{id}/pricing")
    public ResponseEntity<?> updateRoomPricing(
            @PathVariable String id,
            @RequestParam Double price) {
        try {
            RoomResponse response = roomService.updateRoomPricing(id, price);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<?> checkAvailability(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        boolean available = roomService.checkAvailability(id, checkIn, checkOut);
        Map<String, Object> response = new HashMap<>();
        response.put("roomId", id);
        response.put("checkIn", checkIn);
        response.put("checkOut", checkOut);
        response.put("available", available);
        return ResponseEntity.ok(response);
    }
}
