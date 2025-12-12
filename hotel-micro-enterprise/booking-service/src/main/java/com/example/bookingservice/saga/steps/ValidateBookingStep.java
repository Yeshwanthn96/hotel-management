package com.example.bookingservice.saga.steps;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.BookingStatus;
import com.example.bookingservice.saga.SagaContext;
import com.example.bookingservice.saga.SagaStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ValidateBookingStep implements SagaStep {
    private static final Logger logger = LoggerFactory.getLogger(ValidateBookingStep.class);

    @Override
    public boolean execute(SagaContext context) {
        Booking booking = context.getBooking();

        logger.info("Validating booking: {}", booking.getId());

        // Validate dates
        if (booking.getCheckInDate() == null || booking.getCheckOutDate() == null) {
            logger.error("Invalid dates for booking {}", booking.getId());
            context.setErrorMessage("Check-in and check-out dates are required");
            return false;
        }

        if (booking.getCheckInDate().isAfter(booking.getCheckOutDate())) {
            logger.error("Check-in date after check-out date for booking {}", booking.getId());
            context.setErrorMessage("Check-in date must be before check-out date");
            return false;
        }

        // Allow today and future dates
        if (booking.getCheckInDate().isBefore(java.time.LocalDate.now())) {
            logger.error("Check-in date in the past for booking {}", booking.getId());
            context.setErrorMessage("Check-in date cannot be in the past");
            return false;
        }

        // Validate guests
        if (booking.getNumberOfGuests() < 1) {
            logger.error("Invalid number of guests for booking {}", booking.getId());
            context.setErrorMessage("Number of guests must be at least 1");
            return false;
        }

        // Validate IDs
        if (booking.getHotelId() == null || booking.getRoomId() == null || booking.getUserId() == null) {
            logger.error("Missing hotel, room, or user ID for booking {}", booking.getId());
            context.setErrorMessage("Hotel, room, and user information are required");
            return false;
        }

        logger.info("Booking validation successful for booking {}", booking.getId());
        booking.setStatus(BookingStatus.PENDING);
        return true;
    }

    @Override
    public void compensate(SagaContext context) {
        // No compensation needed for validation
        logger.info("No compensation needed for validation step");
    }

    @Override
    public String getStepName() {
        return "ValidateBooking";
    }
}
