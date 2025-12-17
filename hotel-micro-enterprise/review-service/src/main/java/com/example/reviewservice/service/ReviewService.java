package com.example.reviewservice.service;

import com.example.reviewservice.model.Review;
import com.example.reviewservice.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    @Qualifier("directRestTemplate")
    private RestTemplate restTemplate;

    private static final String NOTIFICATION_SERVICE_URL = "http://localhost:8095/api/notifications";

    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }

    public Optional<Review> getReview(String id) {
        return reviewRepository.findById(id);
    }

    public List<Review> getHotelReviews(String hotelId) {
        // Return all reviews (no status filtering needed)
        return reviewRepository.findByHotelId(hotelId);
    }

    public List<Review> getUserReviews(String userId) {
        return reviewRepository.findByUserId(userId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public void deleteReview(String id) {
        // Get the review to find associated notification
        reviewRepository.findById(id).ifPresent(review -> {
            // Delete the review
            reviewRepository.deleteById(id);

            // Delete associated REVIEW_REPLY notifications
            deleteReviewNotifications(id);
        });
    }

    public Optional<Review> addAdminReply(String id, String reply) {
        return reviewRepository.findById(id).map(review -> {
            review.setAdminReply(reply);
            review.setUpdatedAt(LocalDateTime.now());
            Review savedReview = reviewRepository.save(review);

            // Send notification to user
            sendNotificationToUser(savedReview);

            return savedReview;
        });
    }

    public Optional<Review> addUserReply(String id, String userReply) {
        return reviewRepository.findById(id).map(review -> {
            review.setUserReply(userReply);
            review.setUpdatedAt(LocalDateTime.now());
            return reviewRepository.save(review);
        });
    }

    /**
     * Send notification to user when hotel replies to their review
     */
    private void sendNotificationToUser(Review review) {
        try {
            Map<String, String> notificationRequest = new HashMap<>();
            notificationRequest.put("userId", review.getUserId());
            notificationRequest.put("type", "REVIEW_REPLY");
            notificationRequest.put("title", "Hotel Replied to Your Review");
            notificationRequest.put("message", "The hotel has responded to your review. Check it out!");
            notificationRequest.put("referenceId", review.getId());

            restTemplate.postForEntity(
                    NOTIFICATION_SERVICE_URL,
                    notificationRequest,
                    String.class);
        } catch (Exception e) {
            // Log error but don't fail the review reply operation
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    /**
     * Delete notifications associated with a review
     */
    private void deleteReviewNotifications(String reviewId) {
        try {
            String deleteUrl = NOTIFICATION_SERVICE_URL + "/reference/" + reviewId;
            restTemplate.delete(deleteUrl);
        } catch (Exception e) {
            // Log error but don't fail the review deletion
            System.err.println("Failed to delete notifications: " + e.getMessage());
        }
    }

    public Optional<Review> updateReview(String id, Review updatedReview) {
        return reviewRepository.findById(id).map(review -> {
            review.setTitle(updatedReview.getTitle());
            review.setComment(updatedReview.getComment());
            review.setRating(updatedReview.getRating());
            review.setUpdatedAt(LocalDateTime.now());
            return reviewRepository.save(review);
        });
    }

    /**
     * Compute average rating using Java 8 Streams
     */
    public Double getAverageRating(String hotelId) {
        List<Review> reviews = reviewRepository.findByHotelId(hotelId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }

    /**
     * Get verified reviews only using Stream filter
     */
    public List<Review> getVerifiedReviews(String hotelId) {
        return reviewRepository.findByHotelId(hotelId).stream()
                .filter(Review::isVerified)
                .collect(Collectors.toList());
    }

    /**
     * Get reviews with minimum rating using Stream filter
     */
    public List<Review> getReviewsByMinRating(String hotelId, int minRating) {
        return reviewRepository.findByHotelId(hotelId).stream()
                .filter(review -> review.getRating() >= minRating)
                .sorted(Comparator.comparing(Review::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Get rating distribution using Streams and Collectors.groupingBy
     */
    public Map<Integer, Long> getRatingDistribution(String hotelId) {
        return reviewRepository.findByHotelId(hotelId).stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));
    }

    /**
     * Get total review count by hotel
     */
    public long getReviewCount(String hotelId) {
        return reviewRepository.findByHotelId(hotelId).stream().count();
    }

    /**
     * Get hotels with their average ratings sorted (for analytics)
     */
    public Map<String, Double> getHotelRatingsMap() {
        return reviewRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        Review::getHotelId,
                        Collectors.averagingInt(Review::getRating)));
    }

    /**
     * Get top-rated hotels using Streams
     */
    public List<Map.Entry<String, Double>> getTopRatedHotels(int limit) {
        return getHotelRatingsMap().entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get percentage of verified reviews
     */
    public double getVerifiedReviewPercentage(String hotelId) {
        List<Review> reviews = reviewRepository.findByHotelId(hotelId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        long verifiedCount = reviews.stream()
                .filter(Review::isVerified)
                .count();
        return (verifiedCount * 100.0) / reviews.size();
    }

    /**
     * Get review statistics for a hotel
     */
    public Map<String, Object> getReviewStatistics(String hotelId) {
        List<Review> reviews = reviewRepository.findByHotelId(hotelId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReviews", reviews.size());
        stats.put("averageRating", getAverageRating(hotelId));
        stats.put("verifiedPercentage", getVerifiedReviewPercentage(hotelId));
        stats.put("ratingDistribution", getRatingDistribution(hotelId));

        // Get highest and lowest ratings
        OptionalInt maxRating = reviews.stream().mapToInt(Review::getRating).max();
        OptionalInt minRating = reviews.stream().mapToInt(Review::getRating).min();

        stats.put("highestRating", maxRating.isPresent() ? maxRating.getAsInt() : 0);
        stats.put("lowestRating", minRating.isPresent() ? minRating.getAsInt() : 0);

        return stats;
    }
}
