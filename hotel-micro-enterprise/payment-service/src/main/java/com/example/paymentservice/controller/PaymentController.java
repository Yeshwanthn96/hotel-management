package com.example.paymentservice.controller;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> processPayment(@RequestBody Map<String, Object> request) {
        try {
            String bookingId = (String) request.get("bookingId");
            String userId = (String) request.get("userId");
            double amount = ((Number) request.get("amount")).doubleValue();
            String paymentMethod = (String) request.get("paymentMethod");

            logger.info("Processing payment for booking: {}", bookingId);
            Payment payment = paymentService.processPayment(bookingId, userId, amount, paymentMethod);

            if (payment.getStatus() == com.example.paymentservice.model.PaymentStatus.COMPLETED) {
                return ResponseEntity.status(HttpStatus.CREATED).body(payment);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(payment);
            }
        } catch (Exception e) {
            logger.error("Error processing payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            String bookingId = (String) request.get("bookingId");
            double amount = ((Number) request.get("amount")).doubleValue();

            Map<String, Object> response = new HashMap<>();
            response.put("clientSecret", "pi_" + System.currentTimeMillis() + "_secret_demo");
            response.put("bookingId", bookingId);
            response.put("amount", amount);
            response.put("currency", "usd");

            logger.info("Payment intent created for booking: {}", bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating payment intent: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<Payment> refundPayment(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        try {
            double amount = ((Number) request.get("amount")).doubleValue();
            String reason = (String) request.getOrDefault("reason", "User requested refund");

            logger.info("Processing refund for payment: {}", id);
            Payment payment = paymentService.refundPayment(id, amount, reason);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            logger.error("Error processing refund: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPayment(@PathVariable String id) {
        try {
            Payment payment = paymentService.getPaymentById(id);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            logger.error("Error getting payment: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Payment> getPaymentByBooking(@PathVariable String bookingId) {
        try {
            Payment payment = paymentService.getPaymentByBookingId(bookingId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            logger.error("Error getting payment for booking: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getUserPayments(@PathVariable String userId) {
        try {
            List<Payment> payments = paymentService.getUserPayments(userId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            logger.error("Error getting user payments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        try {
            List<Payment> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            logger.error("Error getting all payments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
