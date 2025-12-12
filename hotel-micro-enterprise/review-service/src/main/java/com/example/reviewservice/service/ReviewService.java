package com.example.reviewservice.service;

import com.example.reviewservice.model.Review;
import com.example.reviewservice.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }

    public Optional<Review> getReview(String id) {
        return reviewRepository.findById(id);
    }

    public List<Review> getHotelReviews(String hotelId) {
        return reviewRepository.findByHotelId(hotelId);
    }

    public List<Review> getUserReviews(String userId) {
        return reviewRepository.findByUserId(userId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public void deleteReview(String id) {
        reviewRepository.deleteById(id);
    }

    public Optional<Review> approveReview(String id) {
        return reviewRepository.findById(id).map(review -> {
            review.setVerified(true);
            return reviewRepository.save(review);
        });
    }

    public Optional<Review> rejectReview(String id) {
        return reviewRepository.findById(id).map(review -> {
            review.setVerified(false);
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
