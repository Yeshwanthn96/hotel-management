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
import java.util.Set;
import java.util.stream.Collectors;

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
        // Check if user already has a review for this hotel
        List<Review> existingReviews = reviewService.getUserReviews(review.getUserId());
        boolean alreadyReviewed = existingReviews.stream()
                .anyMatch(r -> r.getHotelId().equals(review.getHotelId()));

        if (alreadyReviewed) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "You have already reviewed this hotel. You can edit your existing review instead."));
        }

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
     * Get hotels eligible for review by user (where they have completed stays but
     * haven't reviewed yet)
     */
    @GetMapping("/user/{userId}/eligible-hotels")
    public ResponseEntity<?> getEligibleHotelsForReview(@PathVariable String userId) {
        try {
            // Get all completed hotels
            String url = BOOKING_SERVICE_URL + "/user/" + userId + "/completed-hotels";
            ResponseEntity<List<String>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<String>>() {
                    });

            List<String> completedHotels = response.getBody();
            if (completedHotels == null) {
                return ResponseEntity.ok(List.of());
            }

            // Get hotels user has already reviewed
            List<Review> userReviews = reviewService.getUserReviews(userId);
            Set<String> reviewedHotels = userReviews.stream()
                    .map(Review::getHotelId)
                    .collect(Collectors.toSet());

            // Filter out already reviewed hotels
            List<String> eligibleHotels = completedHotels.stream()
                    .filter(hotelId -> !reviewedHotels.contains(hotelId))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(eligibleHotels);
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
     * Update a review (User can update their own review)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(
            @PathVariable String id,
            @RequestBody Review updatedReview,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        return reviewService.getReview(id)
                .map(existingReview -> {
                    // Check if user owns this review or is admin
                    if (!existingReview.getUserId().equals(userId)) {
                        return ResponseEntity.status(403).body(Map.of("error", "You can only update your own reviews"));
                    }
                    return reviewService.updateReview(id, updatedReview)
                            .map(ResponseEntity::ok)
                            .orElse(ResponseEntity.notFound().build());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Reply to a review (Admin only)
     */
    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyToReview(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only admins can reply to reviews"));
        }

        String reply = body.get("reply");
        return reviewService.addAdminReply(id, reply)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * User reply to hotel response
     */
    @PostMapping("/{id}/user-reply")
    public ResponseEntity<?> userReplyToHotel(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        return reviewService.getReview(id)
                .map(review -> {
                    // Check if user owns this review
                    if (!review.getUserId().equals(userId)) {
                        return ResponseEntity.status(403)
                                .body(Map.of("error", "You can only reply to your own review"));
                    }
                    String userReply = body.get("userReply");
                    return reviewService.addUserReply(id, userReply)
                            .map(ResponseEntity::ok)
                            .orElse(ResponseEntity.notFound().build());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all reviews (Admin only) - includes all statuses
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllReviewsAdmin(
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only admins can view all reviews"));
        }

        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    /**
     * Delete review (Admin only)
     */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteReview(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only admins can delete reviews"));
        }

        reviewService.deleteReview(id);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
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
