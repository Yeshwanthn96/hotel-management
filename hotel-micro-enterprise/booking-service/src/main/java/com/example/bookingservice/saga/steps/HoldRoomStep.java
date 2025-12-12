package com.example.bookingservice.saga.steps;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.BookingStatus;
import com.example.bookingservice.saga.SagaContext;
import com.example.bookingservice.saga.SagaStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class HoldRoomStep implements SagaStep {
    private static final Logger logger = LoggerFactory.getLogger(HoldRoomStep.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean execute(SagaContext context) {
        Booking booking = context.getBooking();

        logger.info("Holding room {} for booking {}", booking.getRoomId(), booking.getId());

        try {
            // Call Hotel Service to hold the room
            String hotelServiceUrl = "http://localhost:8092/api/rooms/" + booking.getRoomId() + "/hold";

            // For now, simulate room hold (in real implementation, call hotel service)
            // In production: restTemplate.postForObject(hotelServiceUrl, holdRequest,
            // RoomHoldResponse.class);

            // Simulate success
            booking.setStatus(BookingStatus.ROOM_HELD);
            context.putData("roomHeld", true);

            logger.info("Room {} held successfully for booking {}", booking.getRoomId(), booking.getId());
            return true;

        } catch (Exception e) {
            logger.error("Failed to hold room {} for booking {}: {}",
                    booking.getRoomId(), booking.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public void compensate(SagaContext context) {
        Booking booking = context.getBooking();

        logger.info("Releasing room hold for room {} and booking {}",
                booking.getRoomId(), booking.getId());

        try {
            // Call Hotel Service to release the hold
            String hotelServiceUrl = "http://localhost:8092/api/rooms/" + booking.getRoomId() + "/release";

            // For now, simulate release
            // In production: restTemplate.postForObject(hotelServiceUrl, releaseRequest,
            // Void.class);

            context.putData("roomHeld", false);
            logger.info("Room hold released for room {} and booking {}",
                    booking.getRoomId(), booking.getId());

        } catch (Exception e) {
            logger.error("Failed to release room hold: {}", e.getMessage());
        }
    }

    @Override
    public String getStepName() {
        return "HoldRoom";
    }
}
