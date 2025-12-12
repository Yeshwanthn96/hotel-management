package com.example.reviewservice.repository;

import com.example.reviewservice.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByHotelId(String hotelId);

    List<Review> findByUserId(String userId);

    List<Review> findByHotelIdOrderByCreatedAtDesc(String hotelId);

    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);
}
