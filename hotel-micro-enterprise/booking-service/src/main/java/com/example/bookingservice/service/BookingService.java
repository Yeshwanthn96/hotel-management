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

    public BookingResponse getBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return new BookingResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getHotelBookings(String hotelId) {
        return bookingRepository.findByHotelId(hotelId).stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get list of unique hotel IDs where user has completed stays
     * Only returns hotels where checkout date has passed
     */
    public List<String> getCompletedHotelsForUser(String userId) {
        LocalDate today = LocalDate.now();
        return bookingRepository.findByUserId(userId).stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                .filter(booking -> booking.getCheckOutDate().isBefore(today))
                .map(Booking::getHotelId)
                .distinct()
                .collect(Collectors.toList());
    }
}
