package com.example.bookingservice.controller;

import com.example.bookingservice.dto.BookingRequest;
import com.example.bookingservice.dto.BookingResponse;
import com.example.bookingservice.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        try {
            logger.info("Creating booking for user: {}", request.getUserId());
            BookingResponse response = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage());
            BookingResponse errorResponse = new BookingResponse();
            errorResponse.setMessage("Failed to create booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<BookingResponse> confirmBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String paymentId = request.get("paymentId");
            logger.info("Confirming booking: {} with payment: {}", id, paymentId);
            BookingResponse response = bookingService.confirmBooking(id, paymentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error confirming booking: {}", e.getMessage());
            BookingResponse errorResponse = new BookingResponse();
            errorResponse.setMessage("Failed to confirm booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "User requested cancellation");
            logger.info("Cancelling booking: {}", id);
            BookingResponse response = bookingService.cancelBooking(id, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error cancelling booking: {}", e.getMessage());
            BookingResponse errorResponse = new BookingResponse();
            errorResponse.setMessage("Failed to cancel booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable String id) {
        try {
            BookingResponse response = bookingService.getBooking(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting booking: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getUserBookings(@PathVariable String userId) {
        try {
            List<BookingResponse> bookings = bookingService.getUserBookings(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error getting user bookings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<BookingResponse>> getHotelBookings(@PathVariable String hotelId) {
        try {
            List<BookingResponse> bookings = bookingService.getHotelBookings(hotelId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error getting hotel bookings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        try {
            List<BookingResponse> bookings = bookingService.getAllBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error getting all bookings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/hold")
    public ResponseEntity<BookingResponse> holdBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "Admin put booking on hold");
            logger.info("Putting booking on hold: {}", id);
            BookingResponse response = bookingService.holdBooking(id, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error holding booking: {}", e.getMessage());
            BookingResponse errorResponse = new BookingResponse();
            errorResponse.setMessage("Failed to hold booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}/resume")
    public ResponseEntity<BookingResponse> resumeBooking(@PathVariable String id) {
        try {
            logger.info("Resuming booking from hold: {}", id);
            BookingResponse response = bookingService.resumeBooking(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error resuming booking: {}", e.getMessage());
            BookingResponse errorResponse = new BookingResponse();
            errorResponse.setMessage("Failed to resume booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "Admin rejected booking");
            logger.info("Rejecting booking: {}", id);
            BookingResponse response = bookingService.rejectBooking(id, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error rejecting booking: {}", e.getMessage());
            BookingResponse errorResponse = new BookingResponse();
            errorResponse.setMessage("Failed to reject booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get list of hotels where user has completed stays (for reviews)
     */
    @GetMapping("/user/{userId}/completed-hotels")
    public ResponseEntity<List<String>> getCompletedHotels(@PathVariable String userId) {
        try {
            logger.info("Getting completed hotels for user: {}", userId);
            List<String> hotelIds = bookingService.getCompletedHotelsForUser(userId);
            return ResponseEntity.ok(hotelIds);
        } catch (Exception e) {
            logger.error("Error getting completed hotels: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
