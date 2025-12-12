package com.example.bookingservice.saga;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.BookingStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

@Component
public class BookingSagaOrchestrator {
    private static final Logger logger = LoggerFactory.getLogger(BookingSagaOrchestrator.class);

    private final List<SagaStep> steps = new ArrayList<>();

    public void registerStep(SagaStep step) {
        steps.add(step);
    }

    /**
     * Execute saga with compensation on failure
     */
    public boolean executeSaga(SagaContext context) {
        Stack<SagaStep> completedSteps = new Stack<>();
        Booking booking = context.getBooking();

        logger.info("Starting booking saga for booking ID: {}, saga ID: {}",
                booking.getId(), booking.getSagaId());

        try {
            // Execute all steps in order
            for (SagaStep step : steps) {
                logger.info("Executing saga step: {}", step.getStepName());

                boolean success = step.execute(context);

                if (!success) {
                    logger.error("Saga step {} failed, starting compensation", step.getStepName());
                    context.setCompensating(true);
                    compensate(completedSteps, context);
                    booking.setStatus(BookingStatus.FAILED);
                    return false;
                }

                completedSteps.push(step);
                booking.setLastCompletedStep(step.getStepName());
                logger.info("Saga step {} completed successfully", step.getStepName());
            }

            logger.info("Booking saga completed successfully for booking ID: {}", booking.getId());
            return true;

        } catch (Exception e) {
            logger.error("Exception during saga execution: {}", e.getMessage(), e);
            context.setCompensating(true);
            compensate(completedSteps, context);
            booking.setStatus(BookingStatus.FAILED);
            return false;
        }
    }

    /**
     * Compensate completed steps in reverse order
     */
    private void compensate(Stack<SagaStep> completedSteps, SagaContext context) {
        logger.info("Starting compensation for {} completed steps", completedSteps.size());

        while (!completedSteps.isEmpty()) {
            SagaStep step = completedSteps.pop();
            try {
                logger.info("Compensating step: {}", step.getStepName());
                step.compensate(context);
                logger.info("Step {} compensated successfully", step.getStepName());
            } catch (Exception e) {
                logger.error("Error compensating step {}: {}", step.getStepName(), e.getMessage(), e);
                // Continue compensating other steps even if one fails
            }
        }

        logger.info("Compensation completed");
    }
}
