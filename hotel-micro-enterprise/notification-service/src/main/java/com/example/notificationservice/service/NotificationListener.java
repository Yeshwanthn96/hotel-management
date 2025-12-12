package com.example.notificationservice.service;

import com.example.notificationservice.model.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * Observer Pattern Implementation using Kafka
 * This service observes booking events and sends notifications
 */
@Service
public class NotificationListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationListener.class);

    private final EmailService emailService;
    private final SmsService smsService;

    public NotificationListener(EmailService emailService, SmsService smsService) {
        this.emailService = emailService;
        this.smsService = smsService;
    }

    /**
     * Listen to booking-events topic and trigger notifications
     * Observer pattern: reacts to events without coupling to the publisher
     */
    @KafkaListener(topics = "booking-events", groupId = "notification-service-group")
    public void handleBookingEvent(BookingEvent event) {
        logger.info("Received booking event: {} for booking: {}",
                event.getEventType(), event.getBookingId());

        try {
            switch (event.getEventType()) {
                case BOOKING_CONFIRMED:
                    sendBookingConfirmation(event);
                    break;
                case BOOKING_CANCELLED:
                    sendCancellationNotification(event);
                    break;
                case PAYMENT_SUCCESS:
                    sendPaymentSuccessNotification(event);
                    break;
                case PAYMENT_FAILED:
                    sendPaymentFailedNotification(event);
                    break;
                case REFUND_PROCESSED:
                    sendRefundNotification(event);
                    break;
                default:
                    logger.warn("Unhandled event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            logger.error("Error processing booking event: {}", event.getBookingId(), e);
        }
    }

    private void sendBookingConfirmation(BookingEvent event) {
        String subject = "Booking Confirmed - " + event.getHotelName();
        String body = String.format(
                "Dear Guest,\n\n" +
                        "Your booking has been confirmed!\n\n" +
                        "Booking ID: %s\n" +
                        "Hotel: %s\n" +
                        "Check-in: %s\n" +
                        "Check-out: %s\n" +
                        "Amount: $%.2f\n\n" +
                        "Thank you for choosing our hotel!\n\n" +
                        "Best regards,\nHotel Management Team",
                event.getBookingId(),
                event.getHotelName(),
                event.getCheckInDate(),
                event.getCheckOutDate(),
                event.getAmount());

        emailService.sendEmail(event.getUserEmail(), subject, body);
        smsService.sendSms(event.getUserId(), "Booking confirmed for " + event.getHotelName());

        logger.info("Sent booking confirmation to: {}", event.getUserEmail());
    }

    private void sendCancellationNotification(BookingEvent event) {
        String subject = "Booking Cancelled - " + event.getHotelName();
        String body = String.format(
                "Dear Guest,\n\n" +
                        "Your booking has been cancelled.\n\n" +
                        "Booking ID: %s\n" +
                        "Hotel: %s\n\n" +
                        "If you didn't initiate this cancellation, please contact support.\n\n" +
                        "Best regards,\nHotel Management Team",
                event.getBookingId(),
                event.getHotelName());

        emailService.sendEmail(event.getUserEmail(), subject, body);
        smsService.sendSms(event.getUserId(), "Booking " + event.getBookingId() + " cancelled");

        logger.info("Sent cancellation notification to: {}", event.getUserEmail());
    }

    private void sendPaymentSuccessNotification(BookingEvent event) {
        String subject = "Payment Successful - " + event.getHotelName();
        String body = String.format(
                "Dear Guest,\n\n" +
                        "Your payment has been processed successfully!\n\n" +
                        "Payment ID: %s\n" +
                        "Booking ID: %s\n" +
                        "Amount: $%.2f\n\n" +
                        "Thank you for your payment.\n\n" +
                        "Best regards,\nHotel Management Team",
                event.getPaymentId(),
                event.getBookingId(),
                event.getAmount());

        emailService.sendEmail(event.getUserEmail(), subject, body);

        logger.info("Sent payment success notification to: {}", event.getUserEmail());
    }

    private void sendPaymentFailedNotification(BookingEvent event) {
        String subject = "Payment Failed - " + event.getHotelName();
        String body = String.format(
                "Dear Guest,\n\n" +
                        "Unfortunately, your payment could not be processed.\n\n" +
                        "Booking ID: %s\n" +
                        "Amount: $%.2f\n\n" +
                        "Please try again or contact support.\n\n" +
                        "Best regards,\nHotel Management Team",
                event.getBookingId(),
                event.getAmount());

        emailService.sendEmail(event.getUserEmail(), subject, body);
        smsService.sendSms(event.getUserId(), "Payment failed for booking " + event.getBookingId());

        logger.info("Sent payment failed notification to: {}", event.getUserEmail());
    }

    private void sendRefundNotification(BookingEvent event) {
        String subject = "Refund Processed - " + event.getHotelName();
        String body = String.format(
                "Dear Guest,\n\n" +
                        "Your refund has been processed.\n\n" +
                        "Booking ID: %s\n" +
                        "Refund Amount: $%.2f\n" +
                        "Payment ID: %s\n\n" +
                        "The refund will appear in your account within 5-7 business days.\n\n" +
                        "Best regards,\nHotel Management Team",
                event.getBookingId(),
                event.getAmount(),
                event.getPaymentId());

        emailService.sendEmail(event.getUserEmail(), subject, body);
        smsService.sendSms(event.getUserId(), "Refund processed for booking " + event.getBookingId());

        logger.info("Sent refund notification to: {}", event.getUserEmail());
    }
}
