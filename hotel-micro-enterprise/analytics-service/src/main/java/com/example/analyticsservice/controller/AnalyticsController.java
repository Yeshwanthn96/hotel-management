package com.example.analyticsservice.controller;

import com.example.analyticsservice.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Analytics Controller - REST API for analytics reports
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get total revenue
     */
    @GetMapping("/revenue/total")
    public ResponseEntity<Double> getTotalRevenue() {
        return ResponseEntity.ok(analyticsService.getTotalRevenue());
    }

    /**
     * Get revenue by hotel
     */
    @GetMapping("/revenue/by-hotel")
    public ResponseEntity<Map<String, Double>> getRevenueByHotel() {
        return ResponseEntity.ok(analyticsService.getRevenueByHotel());
    }

    /**
     * Get monthly revenue
     */
    @GetMapping("/revenue/monthly")
    public ResponseEntity<Map<String, Double>> getMonthlyRevenue() {
        return ResponseEntity.ok(analyticsService.getMonthlyRevenue());
    }

    /**
     * Get occupancy rates by hotel
     */
    @GetMapping("/occupancy")
    public ResponseEntity<Map<String, Double>> getOccupancyByHotel() {
        return ResponseEntity.ok(analyticsService.getOccupancyByHotel());
    }

    /**
     * Get top-rated hotels
     */
    @GetMapping("/top-rated")
    public ResponseEntity<List<Map.Entry<String, Double>>> getTopRatedHotels(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopRatedHotels(limit));
    }

    /**
     * Get hotels by revenue
     */
    @GetMapping("/hotels/by-revenue")
    public ResponseEntity<List<Map.Entry<String, Double>>> getHotelsByRevenue(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getHotelsByRevenue(limit));
    }

    /**
     * Get bookings by status
     */
    @GetMapping("/bookings/by-status")
    public ResponseEntity<Map<String, Long>> getBookingsByStatus() {
        return ResponseEntity.ok(analyticsService.getBookingsByStatus());
    }

    /**
     * Get average booking amount
     */
    @GetMapping("/bookings/average-amount")
    public ResponseEntity<Double> getAverageBookingAmount() {
        return ResponseEntity.ok(analyticsService.getAverageBookingAmount());
    }

    /**
     * Get comprehensive dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        return ResponseEntity.ok(analyticsService.getDashboardStatistics());
    }
}
