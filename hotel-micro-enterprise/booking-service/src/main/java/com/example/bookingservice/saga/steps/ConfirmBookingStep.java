package com.example.bookingservice.saga.steps;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.BookingStatus;
import com.example.bookingservice.saga.SagaContext;
import com.example.bookingservice.saga.SagaStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ConfirmBookingStep implements SagaStep {
    private static final Logger logger = LoggerFactory.getLogger(ConfirmBookingStep.class);

    @Override
    public boolean execute(SagaContext context) {
        Booking booking = context.getBooking();

        logger.info("Processing booking {} - awaiting admin approval", booking.getId());

        try {
            // After payment success, set status to PAYMENT_PENDING (awaiting admin
            // approval)
            // Admin will change it to CONFIRMED after review
            booking.setStatus(BookingStatus.PAYMENT_PENDING);

            // Log that booking is pending admin approval
            logger.info("Booking {} is now PAYMENT_PENDING - awaiting admin approval", booking.getId());

            context.putData("bookingConfirmed", true);

            logger.info("Booking {} processed successfully - pending admin approval", booking.getId());
            return true;

        } catch (Exception e) {
            logger.error("Failed to process booking {}: {}", booking.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public void compensate(SagaContext context) {
        Booking booking = context.getBooking();

        logger.info("Compensating booking confirmation for booking {}", booking.getId());

        // Cancel the booking
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason("Saga compensation - booking failed");

        // Send cancellation notification
        logger.info("Sending cancellation notification for booking {}", booking.getId());
        // In production: notificationService.sendBookingCancellation(booking);

        context.putData("bookingConfirmed", false);
    }

    @Override
    public String getStepName() {
        return "ConfirmBooking";
    }
}
