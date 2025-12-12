package com.example.bookingservice.saga.steps;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.BookingStatus;
import com.example.bookingservice.saga.SagaContext;
import com.example.bookingservice.saga.SagaStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ProcessPaymentStep implements SagaStep {
    private static final Logger logger = LoggerFactory.getLogger(ProcessPaymentStep.class);

    @Override
    public boolean execute(SagaContext context) {
        Booking booking = context.getBooking();
        String paymentMethod = context.getPaymentMethod();

        logger.info("Processing payment for booking {} using method {}",
                booking.getId(), paymentMethod);

        try {
            booking.setStatus(BookingStatus.PAYMENT_PENDING);

            // Payment will be processed via Payment Service separately
            // This step just marks the booking as ready for payment
            context.putData("paymentReady", true);

            logger.info("Payment step prepared for booking {}", booking.getId());
            return true;

        } catch (Exception e) {
            logger.error("Failed to process payment for booking {}: {}",
                    booking.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public void compensate(SagaContext context) {
        Booking booking = context.getBooking();

        logger.info("Compensating payment for booking {}", booking.getId());

        try {
            // If payment was completed, initiate refund
            if (booking.getPaymentId() != null) {
                logger.info("Initiating refund for payment {} and booking {}",
                        booking.getPaymentId(), booking.getId());
                // Call Payment Service to refund
                // In production: paymentService.refund(booking.getPaymentId());
            }

            context.putData("paymentReady", false);
            logger.info("Payment compensation completed for booking {}", booking.getId());

        } catch (Exception e) {
            logger.error("Failed to compensate payment: {}", e.getMessage());
        }
    }

    @Override
    public String getStepName() {
        return "ProcessPayment";
    }
}
