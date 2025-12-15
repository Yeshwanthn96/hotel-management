package com.example.hotelservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "hotel_services")
public class HotelService {
    @Id
    private String id;
    private String name;
    private String description;
    private String category; // TRANSPORTATION, SPA, DINING, ENTERTAINMENT, etc.
    private Double price;
    private Integer duration; // in minutes
    private List<String> availability; // Days of week
    private List<TimeSlot> timeSlots;
    private Integer maxCapacity;
    private String imageUrl;
    private Boolean active;
    private List<String> hotelIds; // Hotels offering this service
    private String createdBy; // Admin ID
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nested class for time slots
    public static class TimeSlot {
        private String startTime; // HH:mm format
        private String endTime;
        private Integer availableSlots;

        public TimeSlot() {
        }

        public TimeSlot(String startTime, String endTime, Integer availableSlots) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.availableSlots = availableSlots;
        }

        // Getters and setters
        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getEndTime() {
            return endTime;
        }

        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }

        public Integer getAvailableSlots() {
            return availableSlots;
        }

        public void setAvailableSlots(Integer availableSlots) {
            this.availableSlots = availableSlots;
        }
    }

    // Constructors
    public HotelService() {
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public List<String> getAvailability() {
        return availability;
    }

    public void setAvailability(List<String> availability) {
        this.availability = availability;
    }

    public List<TimeSlot> getTimeSlots() {
        return timeSlots;
    }

    public void setTimeSlots(List<TimeSlot> timeSlots) {
        this.timeSlots = timeSlots;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public List<String> getHotelIds() {
        return hotelIds;
    }

    public void setHotelIds(List<String> hotelIds) {
        this.hotelIds = hotelIds;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
