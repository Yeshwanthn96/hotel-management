package com.example.analyticsservice.service;

import com.example.analyticsservice.model.BookingAnalytics;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics Service using Java 8 Streams for data aggregation
 * Generates reports on revenue, occupancy, and top-rated hotels
 * Now uses MongoDB to fetch real booking, hotel, and review data
 */
@Service
public class AnalyticsService {

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Fetch all bookings from MongoDB (hotel_bookings database)
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchAllBookings() {
        try {
            MongoDatabase database = mongoTemplate.getMongoDbFactory()
                    .getMongoDatabase("hotel_bookings");

            MongoCollection<Document> collection = database.getCollection("bookings");
            List<Map<String, Object>> bookings = new ArrayList<>();

            for (Document doc : collection.find()) {
                Map<String, Object> booking = new HashMap<>();
                for (String key : doc.keySet()) {
                    booking.put(key, doc.get(key));
                }
                bookings.add(booking);
            }

            return bookings;
        } catch (Exception e) {
            System.err.println("Error fetching bookings: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Fetch hotel ratings from MongoDB reviews (hotel_reviews database)
     */
    private Map<String, Double> fetchHotelRatings() {
        try {
            MongoDatabase database = mongoTemplate.getMongoDbFactory()
                    .getMongoDatabase("hotel_reviews");
            MongoCollection<Document> collection = database.getCollection("reviews");

            Map<String, List<Integer>> ratingsByHotel = new HashMap<>();
            for (Document doc : collection.find()) {
                String hotelId = doc.getString("hotelId");
                Integer rating = doc.getInteger("rating");
                if (hotelId != null && rating != null) {
                    ratingsByHotel.computeIfAbsent(hotelId, k -> new ArrayList<>()).add(rating);
                }
            }

            // Calculate average rating per hotel
            Map<String, Double> avgRatings = new HashMap<>();
            ratingsByHotel.forEach((hotelId, ratings) -> {
                double avg = ratings.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                avgRatings.put(hotelId, avg);
            });

            return avgRatings;
        } catch (Exception e) {
            System.err.println("Error fetching hotel ratings: " + e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * Fetch hotel capacities (room count * 30 days)
     */
    private Map<String, Integer> fetchHotelCapacities() {
        try {
            MongoDatabase database = mongoTemplate.getMongoDbFactory()
                    .getMongoDatabase("hotel_catalog");
            MongoCollection<Document> collection = database.getCollection("hotels");

            Map<String, Integer> capacities = new HashMap<>();
            for (Document doc : collection.find()) {
                String hotelId = doc.getString("_id");
                if (hotelId == null) {
                    hotelId = doc.getObjectId("_id").toString();
                }
                // Default capacity: 10 rooms * 30 days = 300 room-nights per month
                capacities.put(hotelId, 300);
            }

            return capacities;
        } catch (Exception e) {
            System.err.println("Error fetching hotel capacities: " + e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * Convert MongoDB booking to BookingAnalytics
     */
    @SuppressWarnings("unchecked")
    private BookingAnalytics convertToBookingAnalytics(Map<String, Object> booking) {
        BookingAnalytics analytics = new BookingAnalytics();

        Object idObj = booking.get("_id");
        analytics.setBookingId(idObj != null ? idObj.toString() : "unknown");
        analytics.setHotelId(getString(booking, "hotelId"));
        analytics.setUserId(getString(booking, "userId"));
        analytics.setStatus(getString(booking, "status", "PENDING"));

        Object amountObj = booking.get("totalAmount");
        analytics.setAmount(amountObj != null ? ((Number) amountObj).doubleValue() : 0.0);

        Object guestsObj = booking.get("numberOfGuests");
        analytics.setNumberOfGuests(guestsObj != null ? ((Number) guestsObj).intValue() : 1);

        // Calculate number of nights from check-in/check-out dates
        Object checkInObj = booking.get("checkInDate");
        Object checkOutObj = booking.get("checkOutDate");

        if (checkInObj != null && checkOutObj != null) {
            try {
                LocalDate checkIn = parseDate(checkInObj);
                LocalDate checkOut = parseDate(checkOutObj);

                if (checkIn != null && checkOut != null) {
                    long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
                    analytics.setNumberOfNights((int) Math.max(1, nights));
                    analytics.setCheckInDate(checkIn.atStartOfDay());
                    analytics.setCheckOutDate(checkOut.atStartOfDay());
                }
            } catch (Exception e) {
                analytics.setNumberOfNights(1);
            }
        } else {
            analytics.setNumberOfNights(1);
        }

        // Handle createdAt timestamp
        Object createdAtObj = booking.get("createdAt");
        LocalDateTime createdAt = parseDateTime(createdAtObj);
        analytics.setCreatedAt(createdAt != null ? createdAt : LocalDateTime.now());

        analytics.setHotelName("Hotel " + analytics.getHotelId());

        return analytics;
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private String getString(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        return value != null ? value.toString() : defaultValue;
    }

    @SuppressWarnings("unchecked")
    private LocalDate parseDate(Object dateObj) {
        try {
            if (dateObj instanceof List) {
                List<Integer> dateList = (List<Integer>) dateObj;
                if (dateList.size() >= 3) {
                    return LocalDate.of(dateList.get(0), dateList.get(1), dateList.get(2));
                }
            } else if (dateObj instanceof LocalDate) {
                return (LocalDate) dateObj;
            }
        } catch (Exception e) {
            // Return null if parsing fails
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private LocalDateTime parseDateTime(Object dateTimeObj) {
        try {
            if (dateTimeObj instanceof List) {
                List<Integer> dateList = (List<Integer>) dateTimeObj;
                if (dateList.size() >= 6) {
                    return LocalDateTime.of(
                            dateList.get(0), dateList.get(1), dateList.get(2),
                            dateList.get(3), dateList.get(4), dateList.get(5));
                }
            } else if (dateTimeObj instanceof LocalDateTime) {
                return (LocalDateTime) dateTimeObj;
            }
        } catch (Exception e) {
            // Return null if parsing fails
        }
        return null;
    }

    /**
     * Get all bookings as BookingAnalytics objects
     */
    private List<BookingAnalytics> getAllBookings() {
        List<Map<String, Object>> rawBookings = fetchAllBookings();
        return rawBookings.stream()
                .map(this::convertToBookingAnalytics)
                .collect(Collectors.toList());
    }

    /**
     * Calculate total revenue using Streams
     */
    public Double getTotalRevenue() {
        List<BookingAnalytics> bookings = getAllBookings();
        return bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                .mapToDouble(BookingAnalytics::getAmount)
                .sum();
    }

    /**
     * Calculate revenue by hotel using groupingBy and summingDouble
     */
    public Map<String, Double> getRevenueByHotel() {
        List<BookingAnalytics> bookings = getAllBookings();
        return bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                .collect(Collectors.groupingBy(
                        BookingAnalytics::getHotelId,
                        Collectors.summingDouble(BookingAnalytics::getAmount)));
    }

    /**
     * Calculate revenue by date range
     */
    public Double getRevenueBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        List<BookingAnalytics> bookings = getAllBookings();
        return bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                .filter(b -> !b.getCreatedAt().isBefore(startDate) && !b.getCreatedAt().isAfter(endDate))
                .mapToDouble(BookingAnalytics::getAmount)
                .sum();
    }

    /**
     * Calculate occupancy rate using Streams
     * Occupancy = (Total booked nights / Total available nights) * 100
     */
    public Map<String, Double> getOccupancyByHotel() {
        List<BookingAnalytics> bookings = getAllBookings();
        Map<String, Integer> hotelCapacity = fetchHotelCapacities();

        Map<String, Long> bookedNights = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                .collect(Collectors.groupingBy(
                        BookingAnalytics::getHotelId,
                        Collectors.summingLong(BookingAnalytics::getNumberOfNights)));

        Map<String, Double> occupancyRates = new HashMap<>();
        bookedNights.forEach((hotelId, nights) -> {
            int capacity = hotelCapacity.getOrDefault(hotelId, 300);
            double occupancy = (nights * 100.0) / capacity;
            occupancyRates.put(hotelId, Math.min(occupancy, 100.0));
        });

        return occupancyRates;
    }

    /**
     * Get top-rated hotels using Streams
     */
    public List<Map.Entry<String, Double>> getTopRatedHotels(int limit) {
        Map<String, Double> hotelRatings = fetchHotelRatings();
        return hotelRatings.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get booking count by status
     */
    public Map<String, Long> getBookingsByStatus() {
        List<BookingAnalytics> bookings = getAllBookings();
        return bookings.stream()
                .collect(Collectors.groupingBy(
                        BookingAnalytics::getStatus,
                        Collectors.counting()));
    }

    /**
     * Get average booking amount
     */
    public Double getAverageBookingAmount() {
        List<BookingAnalytics> bookings = getAllBookings();
        return bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                .mapToDouble(BookingAnalytics::getAmount)
                .average()
                .orElse(0.0);
    }

    /**
     * Get hotels sorted by revenue
     */
    public List<Map.Entry<String, Double>> getHotelsByRevenue(int limit) {
        return getRevenueByHotel().entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get comprehensive dashboard statistics
     */
    public Map<String, Object> getDashboardStatistics() {
        List<BookingAnalytics> bookings = getAllBookings();
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalRevenue", getTotalRevenue());
        stats.put("totalBookings", (long) bookings.size());
        stats.put("confirmedBookings", bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .count());
        stats.put("completedBookings", bookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .count());
        stats.put("cancelledBookings", bookings.stream()
                .filter(b -> "CANCELLED".equals(b.getStatus()))
                .count());
        stats.put("averageBookingAmount", getAverageBookingAmount());
        stats.put("revenueByHotel", getRevenueByHotel());
        stats.put("occupancyRates", getOccupancyByHotel());
        stats.put("topRatedHotels", getTopRatedHotels(5));
        stats.put("topRevenueHotels", getHotelsByRevenue(5));

        // Calculate average occupancy
        OptionalDouble avgOccupancy = getOccupancyByHotel().values().stream()
                .mapToDouble(Double::doubleValue)
                .average();
        stats.put("averageOccupancy", avgOccupancy.isPresent() ? avgOccupancy.getAsDouble() : 0.0);

        return stats;
    }

    /**
     * Get monthly revenue report
     */
    public Map<String, Double> getMonthlyRevenue() {
        List<BookingAnalytics> bookings = getAllBookings();
        return bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                .collect(Collectors.groupingBy(
                        b -> b.getCreatedAt().getYear() + "-" +
                                String.format("%02d", b.getCreatedAt().getMonthValue()),
                        Collectors.summingDouble(BookingAnalytics::getAmount)));
    }
}
