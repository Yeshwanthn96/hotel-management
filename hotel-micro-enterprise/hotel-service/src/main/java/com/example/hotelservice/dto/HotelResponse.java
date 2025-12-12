package com.example.hotelservice.dto;

import com.example.hotelservice.model.Hotel;

import java.time.LocalDateTime;
import java.util.List;

public class HotelResponse {
    private String id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String phone;
    private String email;
    private Double rating;
    private Integer totalReviews;
    private List<String> amenities;
    private List<String> images;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer availableRooms;

    public HotelResponse() {
    }

    public HotelResponse(Hotel hotel) {
        this.id = hotel.getId();
        this.name = hotel.getName();
        this.description = hotel.getDescription();
        this.address = hotel.getAddress();
        this.city = hotel.getCity();
        this.state = hotel.getState();
        this.country = hotel.getCountry();
        this.zipCode = hotel.getZipCode();
        this.phone = hotel.getPhone();
        this.email = hotel.getEmail();
        this.rating = hotel.getRating();
        this.totalReviews = hotel.getTotalReviews();
        this.amenities = hotel.getAmenities();
        this.images = hotel.getImages();
        this.active = hotel.isActive();
        this.createdAt = hotel.getCreatedAt();
        this.updatedAt = hotel.getUpdatedAt();
    }

    // Getters and Setters
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
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

    public Integer getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(Integer availableRooms) {
        this.availableRooms = availableRooms;
    }
}
