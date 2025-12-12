package com.example.bookingservice.model;

public enum BookingStatus {
    PENDING, // Initial state when booking is created
    ROOM_HELD, // Room successfully held
    PAYMENT_PENDING, // Waiting for payment
    PAYMENT_COMPLETED, // Payment successful
    CONFIRMED, // Booking confirmed
    COMPLETED, // Booking completed (checked out)
    CANCELLED, // Booking cancelled by user
    FAILED, // Booking failed (saga compensation)
    EXPIRED // Booking expired (timeout)
}
