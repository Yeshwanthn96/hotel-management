package com.example.bookingservice.scheduler;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.BookingStatus;
import com.example.bookingservice.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BookingStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(BookingStatusScheduler.class);

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Runs every hour to check for completed stays
     * Updates CONFIRMED bookings to STAY_COMPLETED after checkout date passes
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void updateCompletedStays() {
        logger.info("Running scheduled task to update completed stays");

        LocalDate today = LocalDate.now();

        // Find all confirmed bookings where checkout date has passed
        List<Booking> confirmedBookings = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                .filter(booking -> booking.getCheckOutDate() != null)
                .filter(booking -> booking.getCheckOutDate().isBefore(today))
                .collect(Collectors.toList());

        int updatedCount = 0;
        for (Booking booking : confirmedBookings) {
            booking.setStatus(BookingStatus.STAY_COMPLETED);
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);
            updatedCount++;
            logger.info("Updated booking {} to STAY_COMPLETED (checkout: {})",
                    booking.getId(), booking.getCheckOutDate());
        }

        if (updatedCount > 0) {
            logger.info("Updated {} bookings to STAY_COMPLETED status", updatedCount);
        }
    }
}
