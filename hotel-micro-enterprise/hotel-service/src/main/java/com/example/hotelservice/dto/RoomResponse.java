package com.example.hotelservice.dto;

import com.example.hotelservice.model.Room;

import java.time.LocalDateTime;
import java.util.List;

public class RoomResponse {
    private String id;
    private String hotelId;
    private String roomNumber;
    private String roomType;
    private String description;
    private Integer capacity;
    private Integer bedCount;
    private String bedType;
    private Double pricePerNight;
    private Double area;
    private List<String> amenities;
    private List<String> images;
    private boolean available;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RoomResponse() {
    }

    public RoomResponse(Room room) {
        this.id = room.getId();
        this.hotelId = room.getHotelId();
        this.roomNumber = room.getRoomNumber();
        this.roomType = room.getRoomType();
        this.description = room.getDescription();
        this.capacity = room.getCapacity();
        this.bedCount = room.getBedCount();
        this.bedType = room.getBedType();
        this.pricePerNight = room.getPricePerNight();
        this.area = room.getArea();
        this.amenities = room.getAmenities();
        this.images = room.getImages();
        this.available = room.isAvailable();
        this.active = room.isActive();
        this.createdAt = room.getCreatedAt();
        this.updatedAt = room.getUpdatedAt();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getHotelId() {
        return hotelId;
    }

    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getBedCount() {
        return bedCount;
    }

    public void setBedCount(Integer bedCount) {
        this.bedCount = bedCount;
    }

    public String getBedType() {
        return bedType;
    }

    public void setBedType(String bedType) {
        this.bedType = bedType;
    }

    public Double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(Double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
