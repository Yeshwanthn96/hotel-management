package com.example.reviewservice.controller;

import com.example.reviewservice.model.Review;
import com.example.reviewservice.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private RestTemplate restTemplate;

    private static final String BOOKING_SERVICE_URL = "http://BOOKING-SERVICE/api/bookings";

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        // Validate that user has stayed at this hotel
        try {
            String url = BOOKING_SERVICE_URL + "/user/" + review.getUserId() + "/completed-hotels";
            ResponseEntity<List<String>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<String>>() {
                    });

            List<String> completedHotels = response.getBody();
            if (completedHotels == null || !completedHotels.contains(review.getHotelId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You can only review hotels where you have completed a stay"));
            }

            Review created = reviewService.createReview(review);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Unable to verify booking: " + e.getMessage()));
        }
    }

    /**
     * Get hotels eligible for review by user (where they have completed stays)
     */
    @GetMapping("/user/{userId}/eligible-hotels")
    public ResponseEntity<?> getEligibleHotelsForReview(@PathVariable String userId) {
        try {
            String url = BOOKING_SERVICE_URL + "/user/" + userId + "/completed-hotels";
            ResponseEntity<List<String>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<String>>() {
                    });
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Unable to fetch eligible hotels: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReview(@PathVariable String id) {
        return reviewService.getReview(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Review>> getHotelReviews(@PathVariable String hotelId) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable String userId) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Approve a review (Admin only)
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<Review> approveReview(@PathVariable String id) {
        return reviewService.approveReview(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Reject a review (Admin only)
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<Review> rejectReview(@PathVariable String id) {
        return reviewService.rejectReview(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/hotel/{hotelId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable String hotelId) {
        return ResponseEntity.ok(reviewService.getAverageRating(hotelId));
    }

    /**
     * Get verified reviews only
     */
    @GetMapping("/hotel/{hotelId}/verified")
    public ResponseEntity<List<Review>> getVerifiedReviews(@PathVariable String hotelId) {
        return ResponseEntity.ok(reviewService.getVerifiedReviews(hotelId));
    }

    /**
     * Get reviews by minimum rating
     */
    @GetMapping("/hotel/{hotelId}/rating/{minRating}")
    public ResponseEntity<List<Review>> getReviewsByMinRating(
            @PathVariable String hotelId,
            @PathVariable int minRating) {
        return ResponseEntity.ok(reviewService.getReviewsByMinRating(hotelId, minRating));
    }

    /**
     * Get rating distribution
     */
    @GetMapping("/hotel/{hotelId}/distribution")
    public ResponseEntity<Map<Integer, Long>> getRatingDistribution(@PathVariable String hotelId) {
        return ResponseEntity.ok(reviewService.getRatingDistribution(hotelId));
    }

    /**
     * Get review statistics
     */
    @GetMapping("/hotel/{hotelId}/statistics")
    public ResponseEntity<Map<String, Object>> getReviewStatistics(@PathVariable String hotelId) {
        return ResponseEntity.ok(reviewService.getReviewStatistics(hotelId));
    }

    /**
     * Get top-rated hotels
     */
    @GetMapping("/top-rated")
    public ResponseEntity<List<Map.Entry<String, Double>>> getTopRatedHotels(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reviewService.getTopRatedHotels(limit));
    }
}
