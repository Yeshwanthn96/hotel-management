package com.example.bookingservice.model;

public enum BookingStatus {
    PENDING, // Initial state when booking is created
    ROOM_HELD, // Room successfully held
    PAYMENT_PENDING, // Waiting for payment
    PAYMENT_COMPLETED, // Payment successful
    CONFIRMED, // Booking confirmed
    ON_HOLD, // Admin put booking on hold
    REJECTED, // Admin rejected booking
    STAY_COMPLETED, // Guest has checked out - eligible for review
    COMPLETED, // Booking completed (checked out)
    CANCELLED, // Booking cancelled by user
    FAILED, // Booking failed (saga compensation)
    EXPIRED // Booking expired (timeout)
}
