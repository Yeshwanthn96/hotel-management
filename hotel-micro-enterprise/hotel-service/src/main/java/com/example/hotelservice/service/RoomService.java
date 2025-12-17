package com.example.hotelservice.service;

import com.example.hotelservice.dto.RoomRequest;
import com.example.hotelservice.dto.RoomResponse;
import com.example.hotelservice.model.Room;
import com.example.hotelservice.repository.HotelRepository;
import com.example.hotelservice.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public RoomResponse createRoom(RoomRequest request) {
        // Validate hotel exists
        if (!hotelRepository.existsById(request.getHotelId())) {
            throw new RuntimeException("Hotel not found");
        }

        Room room = new Room();
        room.setHotelId(request.getHotelId());
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setDescription(request.getDescription());
        room.setCapacity(request.getCapacity());
        room.setBedCount(request.getBedCount());
        room.setBedType(request.getBedType());
        room.setPricePerNight(request.getPricePerNight());
        room.setArea(request.getArea());
        room.setAmenities(request.getAmenities());
        room.setImages(request.getImages());
        room.setAvailable(true);
        room.setActive(true);
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());

        Room savedRoom = roomRepository.save(room);
        return new RoomResponse(savedRoom);
    }

    public RoomResponse updateRoom(String id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setDescription(request.getDescription());
        room.setCapacity(request.getCapacity());
        room.setBedCount(request.getBedCount());
        room.setBedType(request.getBedType());
        room.setPricePerNight(request.getPricePerNight());
        room.setArea(request.getArea());
        room.setAmenities(request.getAmenities());
        room.setImages(request.getImages());
        room.setUpdatedAt(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        return new RoomResponse(updatedRoom);
    }

    public RoomResponse getRoomById(String id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return new RoomResponse(room);
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getRoomsByHotelId(String hotelId) {
        return roomRepository.findByHotelId(hotelId).stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getAvailableRoomsByHotelId(String hotelId) {
        return roomRepository.findByHotelIdAndActiveAndAvailable(hotelId, true, true).stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> searchRooms(String hotelId, Integer capacity, LocalDate checkIn, LocalDate checkOut) {
        List<Room> rooms;

        if (capacity != null) {
            rooms = roomRepository.findByHotelIdAndCapacityGreaterThanEqualAndActiveAndAvailable(hotelId, capacity,
                    true, true);
        } else {
            rooms = roomRepository.findByHotelIdAndActiveAndAvailable(hotelId, true, true);
        }

        // Filter by date availability (simplified - would need calendar check in
        // production)
        if (checkIn != null && checkOut != null) {
            // For now, return available rooms (calendar check can be added later)
            rooms = rooms.stream()
                    .filter(Room::isAvailable)
                    .collect(Collectors.toList());
        }

        return rooms.stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
    }

    public void deleteRoom(String id) {
        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Room not found");
        }
        roomRepository.deleteById(id);
    }

    public RoomResponse toggleRoomAvailability(String id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setAvailable(!room.isAvailable());
        room.setUpdatedAt(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        return new RoomResponse(updatedRoom);
    }

    public RoomResponse activateRoom(String id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setActive(true);
        room.setUpdatedAt(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        return new RoomResponse(updatedRoom);
    }

    public RoomResponse deactivateRoom(String id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setActive(false);
        room.setUpdatedAt(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        return new RoomResponse(updatedRoom);
    }

    public RoomResponse updateRoomPricing(String id, Double newPrice) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setPricePerNight(newPrice);
        room.setUpdatedAt(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        return new RoomResponse(updatedRoom);
    }

    public boolean checkAvailability(String id, LocalDate checkIn, LocalDate checkOut) {
        // Simplified availability check - would need to implement calendar-based
        // checking in production
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return room.isAvailable() && room.isActive();
    }
}
