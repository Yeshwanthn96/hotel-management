package com.example.hotelservice.repository;

import com.example.hotelservice.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    List<Room> findByHotelId(String hotelId);

    List<Room> findByHotelIdAndActiveAndAvailable(String hotelId, boolean active, boolean available);

    List<Room> findByHotelIdAndCapacityGreaterThanEqualAndActiveAndAvailable(
            String hotelId, Integer capacity, boolean active, boolean available);
}
