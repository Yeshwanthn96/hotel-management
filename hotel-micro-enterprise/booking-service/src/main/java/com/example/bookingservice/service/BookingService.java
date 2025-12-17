package com.example.bookingservice.service;

import com.example.bookingservice.dto.BookingRequest;
import com.example.bookingservice.dto.BookingResponse;
import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.BookingStatus;
import com.example.bookingservice.repository.BookingRepository;
import com.example.bookingservice.saga.BookingSagaOrchestrator;
import com.example.bookingservice.saga.SagaContext;
import com.example.bookingservice.saga.steps.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingSagaOrchestrator sagaOrchestrator;

    @Autowired
    private ValidateBookingStep validateStep;

    @Autowired
    private HoldRoomStep holdRoomStep;

    @Autowired
    private ProcessPaymentStep processPaymentStep;

    @Autowired
    private ConfirmBookingStep confirmBookingStep;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String HOTEL_SERVICE_URL = "http://localhost:8081/api/hotels";
    private static final String NOTIFICATION_SERVICE_URL = "http://localhost:8095/api/notifications";

    @PostConstruct
    public void init() {
        // Register saga steps in order
        sagaOrchestrator.registerStep(validateStep);
        sagaOrchestrator.registerStep(holdRoomStep);
        sagaOrchestrator.registerStep(processPaymentStep);
        // Confirmation happens after payment is completed
    }

    public BookingResponse createBooking(BookingRequest request) {
        logger.info("Creating booking for user: {}, hotel: {}, room: {}",
                request.getUserId(), request.getHotelId(), request.getRoomId());

        // Create booking
        Booking booking = new Booking();
        booking.setUserId(request.getUserId());
        booking.setHotelId(request.getHotelId());
        booking.setRoomId(request.getRoomId());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumberOfGuests(request.getNumberOfGuests());

        // Calculate total amount (mock - should call room service)
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        double pricePerNight = 150.0; // Mock price
        booking.setTotalAmount(nights * pricePerNight);

        // Create saga context
        SagaContext context = new SagaContext(booking, request.getPaymentMethod());

        // Execute saga
        boolean success = sagaOrchestrator.executeSaga(context);

        // Save booking
        bookingRepository.save(booking);

        BookingResponse response = new BookingResponse(booking);
        if (success) {
            response.setMessage("Booking created successfully. Please proceed with payment.");
        } else {
            // Use specific error message from context if available
            String errorMsg = context.getErrorMessage();
            if (errorMsg != null && !errorMsg.isEmpty()) {
                response.setMessage("Booking failed: " + errorMsg);
            } else {
                response.setMessage("Booking failed. Please try again.");
            }
        }

        return response;
    }

    public BookingResponse confirmBooking(String bookingId, String paymentId) {
        logger.info("Confirming booking: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Booking not in correct state for confirmation");
        }

        booking.setPaymentId(paymentId);

        // Execute confirmation step
        SagaContext context = new SagaContext(booking, null);
        try {
            boolean success = confirmBookingStep.execute(context);
            if (success) {
                bookingRepository.save(booking);

                // Send notification to user
                sendNotificationToUser(
                        booking.getUserId(),
                        "BOOKING_CONFIRMED",
                        "Booking Confirmed! 🎉",
                        "Your booking #" + booking.getId().substring(0, 8)
                                + " has been confirmed. Thank you for choosing our hotel!",
                        booking.getId());

                BookingResponse response = new BookingResponse(booking);
                response.setMessage("Booking confirmed successfully");
                return response;
            } else {
                throw new RuntimeException("Failed to confirm booking");
            }
        } catch (Exception e) {
            logger.error("Error confirming booking: {}", e.getMessage());
            throw new RuntimeException("Failed to confirm booking: " + e.getMessage());
        }
    }

    public BookingResponse cancelBooking(String bookingId, String reason) {
        logger.info("Cancelling booking: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        bookingRepository.save(booking);

        // Trigger refund if payment was completed
        if (booking.getPaymentId() != null) {
            logger.info("Triggering refund for payment: {}", booking.getPaymentId());
            // Call payment service to refund
        }

        BookingResponse response = new BookingResponse(booking);
        response.setMessage("Booking cancelled successfully");
        return response;
    }

    public BookingResponse holdBooking(String bookingId, String reason) {
        logger.info("Putting booking on hold: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new RuntimeException("Cannot hold booking in current state: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.ON_HOLD);
        booking.setCancellationReason("ON HOLD: " + reason);
        bookingRepository.save(booking);

        BookingResponse response = new BookingResponse(booking);
        response.setMessage("Booking put on hold: " + reason);
        return response;
    }

    public BookingResponse resumeBooking(String bookingId) {
        logger.info("Resuming booking from hold: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.ON_HOLD) {
            throw new RuntimeException("Booking is not on hold, current state: " + booking.getStatus());
        }

        // Resume to PENDING status so user can continue with payment
        booking.setStatus(BookingStatus.PENDING);
        booking.setCancellationReason(null);
        bookingRepository.save(booking);

        // Send notification to user
        sendNotificationToUser(
                booking.getUserId(),
                "BOOKING_APPROVED",
                "Booking Approved! ✅",
                "Great news! Your booking #" + booking.getId().substring(0, 8)
                        + " has been approved by admin. You can now proceed with the payment.",
                booking.getId());

        BookingResponse response = new BookingResponse(booking);
        response.setMessage("Booking resumed from hold");
        return response;
    }

    public BookingResponse rejectBooking(String bookingId, String reason) {
        logger.info("Rejecting booking: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking already cancelled");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setCancellationReason("REJECTED: " + reason);
        bookingRepository.save(booking);

        // Trigger refund if payment was completed
        if (booking.getPaymentId() != null) {
            logger.info("Triggering refund for rejected booking payment: {}", booking.getPaymentId());
            // Call payment service to refund
        }

        // Send notification to user
        sendNotificationToUser(
                booking.getUserId(),
                "BOOKING_REJECTED",
                "Booking Update ❌",
                "Unfortunately, your booking #" + booking.getId().substring(0, 8) + " could not be confirmed. Reason: "
                        + reason,
                booking.getId());

        BookingResponse response = new BookingResponse(booking);
        response.setMessage("Booking rejected and refund initiated: " + reason);
        return response;
    }

    public BookingResponse markStayCompleted(String bookingId) {
        logger.info("Marking stay as completed for booking: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("Only confirmed or completed bookings can be marked as stay completed");
        }

        booking.setStatus(BookingStatus.STAY_COMPLETED);
        bookingRepository.save(booking);

        // Send notification to user
        sendNotificationToUser(
                booking.getUserId(),
                "STAY_COMPLETED",
                "Thank You for Your Stay! 🌟",
                "We hope you enjoyed your stay! Please share your experience by writing a review for booking #"
                        + booking.getId().substring(0, 8),
                booking.getId());

        BookingResponse response = new BookingResponse(booking);
        response.setMessage("Stay completed - User can now write a review");
        return response;
    }

    public BookingResponse updateBookingStatus(String bookingId, String statusString) {
        logger.info("Admin updating booking {} to status: {}", bookingId, statusString);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Parse and validate the status
        BookingStatus newStatus;
        try {
            newStatus = BookingStatus.valueOf(statusString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusString + ". Valid statuses: " +
                    String.join(", ", java.util.Arrays.stream(BookingStatus.values())
                            .map(Enum::name)
                            .toArray(String[]::new)));
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(newStatus);
        bookingRepository.save(booking);

        // Send notification based on new status
        String notificationTitle = "Booking Status Updated";
        String notificationMessage = "Your booking #" + booking.getId().substring(0, 8) +
                " status has been changed from " + oldStatus + " to " + newStatus;

        if (newStatus == BookingStatus.STAY_COMPLETED) {
            notificationTitle = "Thank You for Your Stay! 🌟";
            notificationMessage = "We hope you enjoyed your stay! Please share your experience by writing a review for booking #"
                    + booking.getId().substring(0, 8);
        } else if (newStatus == BookingStatus.CONFIRMED) {
            notificationTitle = "Booking Confirmed ✅";
            notificationMessage = "Great news! Your booking #" + booking.getId().substring(0, 8)
                    + " has been confirmed.";
        } else if (newStatus == BookingStatus.CANCELLED) {
            notificationTitle = "Booking Cancelled ❌";
            notificationMessage = "Your booking #" + booking.getId().substring(0, 8) + " has been cancelled.";
        }

        sendNotificationToUser(
                booking.getUserId(),
                newStatus.name(),
                notificationTitle,
                notificationMessage,
                booking.getId());

        BookingResponse response = new BookingResponse(booking);
        response.setMessage("Booking status updated from " + oldStatus + " to " + newStatus);
        return response;
    }

    public BookingResponse getBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return enrichBookingResponse(new BookingResponse(booking));
    }

    public List<BookingResponse> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(booking -> enrichBookingResponse(new BookingResponse(booking)))
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(booking -> enrichBookingResponse(new BookingResponse(booking)))
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getHotelBookings(String hotelId) {
        return bookingRepository.findByHotelId(hotelId).stream()
                .map(booking -> enrichBookingResponse(new BookingResponse(booking)))
                .collect(Collectors.toList());
    }

    private BookingResponse enrichBookingResponse(BookingResponse response) {
        try {
            // Fetch hotel details
            String hotelUrl = HOTEL_SERVICE_URL + "/" + response.getHotelId();
            java.util.Map<String, Object> hotelResponse = restTemplate.getForObject(hotelUrl, java.util.Map.class);
            if (hotelResponse != null) {
                response.setHotelName((String) hotelResponse.get("name"));
            }

            // Fetch room details - rooms are accessed via /api/rooms/{id}
            String roomUrl = "http://localhost:8081/api/rooms/" + response.getRoomId();
            java.util.Map<String, Object> roomResponse = restTemplate.getForObject(roomUrl, java.util.Map.class);
            if (roomResponse != null) {
                response.setRoomType((String) roomResponse.get("roomType"));
                Object roomNumber = roomResponse.get("roomNumber");
                response.setRoomNumber(roomNumber != null ? roomNumber.toString() : "N/A");
            }

            // Set payment status based on booking status and payment ID
            if (response.getPaymentId() != null && !response.getPaymentId().isEmpty()) {
                response.setPaymentStatus("PAID");
            } else if (response.getStatus() == BookingStatus.PAYMENT_PENDING) {
                response.setPaymentStatus("PENDING");
            } else if (response.getStatus() == BookingStatus.CONFIRMED) {
                response.setPaymentStatus("PAID");
            } else {
                response.setPaymentStatus("UNPAID");
            }
        } catch (Exception e) {
            logger.warn("Failed to enrich booking response: {}", e.getMessage());
            // Set defaults if service calls fail
            response.setHotelName("Unknown Hotel");
            response.setRoomType("Unknown Room");
            response.setRoomNumber("N/A");
        }
        return response;
    }

    /**
     * Get list of unique hotel IDs where user has completed stays
     * Returns hotels with STAY_COMPLETED status (eligible for reviews)
     */
    public List<String> getCompletedHotelsForUser(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .filter(booking -> booking.getStatus() == BookingStatus.STAY_COMPLETED ||
                        booking.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getHotelId)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Send notification to user via notification service
     */
    private void sendNotificationToUser(String userId, String type, String title, String message, String referenceId) {
        try {
            java.util.Map<String, String> notificationRequest = new java.util.HashMap<>();
            notificationRequest.put("userId", userId);
            notificationRequest.put("type", type);
            notificationRequest.put("title", title);
            notificationRequest.put("message", message);
            notificationRequest.put("referenceId", referenceId);

            restTemplate.postForObject(NOTIFICATION_SERVICE_URL, notificationRequest, Object.class);
            logger.info("Notification sent to user: {} - {}", userId, title);
        } catch (Exception e) {
            logger.warn("Failed to send notification to user {}: {}", userId, e.getMessage());
            // Don't fail the booking operation if notification fails
        }
    }
}
