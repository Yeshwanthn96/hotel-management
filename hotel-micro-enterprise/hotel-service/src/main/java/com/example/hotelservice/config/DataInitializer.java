package com.example.hotelservice.config;

import com.example.hotelservice.model.Hotel;
import com.example.hotelservice.model.Room;
import com.example.hotelservice.repository.HotelRepository;
import com.example.hotelservice.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(HotelRepository hotelRepository, RoomRepository roomRepository) {
        return args -> {
            // Only initialize if database is empty
            if (hotelRepository.count() == 0) {
                // Create demo hotels
                Hotel hotel1 = createHotel("1", "Grand Plaza Hotel", "New York", "NY",
                        "Luxury hotel in the heart of Manhattan",
                        Arrays.asList("WiFi", "Pool", "Gym", "Spa", "Restaurant", "Bar"));

                Hotel hotel2 = createHotel("2", "Sunset Beach Resort", "Miami", "FL",
                        "Beachfront paradise with stunning ocean views",
                        Arrays.asList("WiFi", "Beach Access", "Pool", "Restaurant", "Water Sports"));

                Hotel hotel3 = createHotel("3", "Mountain View Lodge", "Denver", "CO",
                        "Cozy mountain retreat with breathtaking views",
                        Arrays.asList("WiFi", "Fireplace", "Hiking", "Restaurant", "Spa"));

                hotelRepository.save(hotel1);
                hotelRepository.save(hotel2);
                hotelRepository.save(hotel3);

                System.out.println("✅ Initialized 3 demo hotels");

                // Create demo rooms for hotel 1
                roomRepository.save(createRoom("1", "1", "101", "Deluxe", 2, 1, "King", 299.99,
                        Arrays.asList("WiFi", "Mini Bar", "TV", "Air Conditioning")));
                roomRepository.save(createRoom("2", "1", "102", "Suite", 4, 2, "Queen", 499.99,
                        Arrays.asList("WiFi", "Mini Bar", "TV", "Air Conditioning", "Living Room", "Kitchen")));
                roomRepository.save(createRoom("3", "1", "201", "Standard", 2, 1, "Queen", 199.99,
                        Arrays.asList("WiFi", "TV", "Air Conditioning")));

                // Create demo rooms for hotel 2
                roomRepository.save(createRoom("4", "2", "101", "Ocean View", 2, 1, "King", 249.99,
                        Arrays.asList("WiFi", "Balcony", "TV", "Beach View")));
                roomRepository.save(createRoom("5", "2", "102", "Family Suite", 4, 2, "Queen", 349.99,
                        Arrays.asList("WiFi", "Balcony", "TV", "Beach View", "Kitchenette")));

                System.out.println("✅ Initialized 5 demo rooms");
            } else {
                System.out.println("ℹ️  Database already initialized, skipping demo data");
            }
        };
    }

    private Hotel createHotel(String id, String name, String city, String state,
            String description, java.util.List<String> amenities) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName(name);
        hotel.setCity(city);
        hotel.setState(state);
        hotel.setCountry("USA");
        hotel.setDescription(description);
        hotel.setAddress("123 Main Street");
        hotel.setZipCode("10001");
        hotel.setPhone("+1-555-" + (1000 + Integer.parseInt(id)));
        hotel.setEmail(name.toLowerCase().replace(" ", "") + "@hotel.com");
        hotel.setAmenities(amenities);
        hotel.setRating(4.5);
        hotel.setTotalReviews(250);
        hotel.setActive(true);
        hotel.setCreatedAt(LocalDateTime.now());
        hotel.setUpdatedAt(LocalDateTime.now());
        hotel.setCreatedBy("admin");
        return hotel;
    }

    private Room createRoom(String id, String hotelId, String roomNumber, String roomType,
            int capacity, int bedCount, String bedType, Double price,
            java.util.List<String> amenities) {
        Room room = new Room();
        room.setId(id);
        room.setHotelId(hotelId);
        room.setRoomNumber(roomNumber);
        room.setRoomType(roomType);
        room.setCapacity(capacity);
        room.setBedCount(bedCount);
        room.setBedType(bedType);
        room.setPricePerNight(price);
        room.setArea(350.0);
        room.setAmenities(amenities);
        room.setDescription("Comfortable " + roomType + " room with " + bedType + " bed");
        room.setAvailable(true);
        room.setActive(true);
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());
        return room;
    }
}
