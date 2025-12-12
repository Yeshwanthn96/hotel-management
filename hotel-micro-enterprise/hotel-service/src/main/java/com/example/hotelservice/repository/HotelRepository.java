package com.example.hotelservice.repository;

import com.example.hotelservice.model.Hotel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends MongoRepository<Hotel, String> {
    List<Hotel> findByCity(String city);

    List<Hotel> findByActive(boolean active);

    List<Hotel> findByCityAndActive(String city, boolean active);
}
