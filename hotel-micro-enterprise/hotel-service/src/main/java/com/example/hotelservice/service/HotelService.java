package com.example.hotelservice.service;

import com.example.hotelservice.dto.HotelRequest;
import com.example.hotelservice.dto.HotelResponse;
import com.example.hotelservice.dto.HotelSearchRequest;
import com.example.hotelservice.model.Hotel;
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
public class HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    public HotelResponse createHotel(HotelRequest request, String createdBy) {
        Hotel hotel = new Hotel();
        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setState(request.getState());
        hotel.setCountry(request.getCountry());
        hotel.setZipCode(request.getZipCode());
        hotel.setPhone(request.getPhone());
        hotel.setEmail(request.getEmail());
        hotel.setAmenities(request.getAmenities());
        hotel.setImages(request.getImages());
        hotel.setActive(true);
        hotel.setCreatedBy(createdBy);
        hotel.setCreatedAt(LocalDateTime.now());
        hotel.setUpdatedAt(LocalDateTime.now());

        Hotel savedHotel = hotelRepository.save(hotel);
        return new HotelResponse(savedHotel);
    }

    public HotelResponse updateHotel(String id, HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setState(request.getState());
        hotel.setCountry(request.getCountry());
        hotel.setZipCode(request.getZipCode());
        hotel.setPhone(request.getPhone());
        hotel.setEmail(request.getEmail());
        hotel.setAmenities(request.getAmenities());
        hotel.setImages(request.getImages());
        hotel.setUpdatedAt(LocalDateTime.now());

        Hotel updatedHotel = hotelRepository.save(hotel);
        return new HotelResponse(updatedHotel);
    }

    public HotelResponse getHotelById(String id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        HotelResponse response = new HotelResponse(hotel);

        // Add available rooms count
        List<Room> availableRooms = roomRepository.findByHotelIdAndActiveAndAvailable(id, true, true);
        response.setAvailableRooms(availableRooms.size());

        return response;
    }

    public List<HotelResponse> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(hotel -> {
                    HotelResponse response = new HotelResponse(hotel);
                    List<Room> availableRooms = roomRepository.findByHotelIdAndActiveAndAvailable(hotel.getId(), true,
                            true);
                    response.setAvailableRooms(availableRooms.size());
                    return response;
                })
                .collect(Collectors.toList());
    }

    public List<HotelResponse> getActiveHotels() {
        return hotelRepository.findByActive(true).stream()
                .map(hotel -> {
                    HotelResponse response = new HotelResponse(hotel);
                    List<Room> availableRooms = roomRepository.findByHotelIdAndActiveAndAvailable(hotel.getId(), true,
                            true);
                    response.setAvailableRooms(availableRooms.size());
                    return response;
                })
                .collect(Collectors.toList());
    }

    public List<HotelResponse> searchHotels(HotelSearchRequest searchRequest) {
        List<Hotel> hotels;

        // Filter by city
        if (searchRequest.getCity() != null && !searchRequest.getCity().isEmpty()) {
            hotels = hotelRepository.findByCity(searchRequest.getCity());
        } else {
            hotels = hotelRepository.findByActive(true);
        }

        return hotels.stream()
                .map(hotel -> {
                    // Get rooms for this hotel that match criteria
                    List<Room> rooms = roomRepository.findByHotelId(hotel.getId()).stream()
                            .filter(room -> room.isActive() && room.isAvailable())
                            .filter(room -> {
                                // Filter by capacity
                                if (searchRequest.getGuests() != null) {
                                    return room.getCapacity() >= searchRequest.getGuests();
                                }
                                return true;
                            })
                            .filter(room -> {
                                // Filter by room type
                                if (searchRequest.getRoomType() != null && !searchRequest.getRoomType().isEmpty()) {
                                    return room.getRoomType().equalsIgnoreCase(searchRequest.getRoomType());
                                }
                                return true;
                            })
                            .filter(room -> {
                                // Filter by price range
                                if (searchRequest.getMinPrice() != null
                                        && room.getPricePerNight() < searchRequest.getMinPrice()) {
                                    return false;
                                }
                                if (searchRequest.getMaxPrice() != null
                                        && room.getPricePerNight() > searchRequest.getMaxPrice()) {
                                    return false;
                                }
                                return true;
                            })
                            .filter(room -> {
                                // Check date availability (simplified for now)
                                if (searchRequest.getCheckInDate() != null && searchRequest.getCheckOutDate() != null) {
                                    return room.isAvailable();
                                }
                                return true;
                            })
                            .collect(Collectors.toList());

                    // Only include hotels that have matching rooms
                    if (!rooms.isEmpty()) {
                        HotelResponse response = new HotelResponse(hotel);
                        response.setAvailableRooms(rooms.size());
                        return response;
                    }
                    return null;
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    public void deleteHotel(String id) {
        if (!hotelRepository.existsById(id)) {
            throw new RuntimeException("Hotel not found");
        }
        hotelRepository.deleteById(id);
    }

    public HotelResponse toggleHotelStatus(String id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        hotel.setActive(!hotel.isActive());
        hotel.setUpdatedAt(LocalDateTime.now());

        Hotel updatedHotel = hotelRepository.save(hotel);
        return new HotelResponse(updatedHotel);
    }
}
