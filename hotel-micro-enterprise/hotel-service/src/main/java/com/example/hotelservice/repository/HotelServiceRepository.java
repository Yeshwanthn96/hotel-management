package com.example.hotelservice.repository;

import com.example.hotelservice.model.HotelService;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelServiceRepository extends MongoRepository<HotelService, String> {
    List<HotelService> findByActive(Boolean active);

    List<HotelService> findByCategory(String category);

    List<HotelService> findByHotelIdsContaining(String hotelId);

    List<HotelService> findByCreatedBy(String adminId);
}
