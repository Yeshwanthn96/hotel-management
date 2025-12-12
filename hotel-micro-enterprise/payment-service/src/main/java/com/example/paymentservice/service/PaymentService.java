package com.example.paymentservice.service;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.model.PaymentStatus;
import com.example.paymentservice.repository.PaymentRepository;
import com.example.paymentservice.strategy.PaymentStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private Map<String, PaymentStrategy> paymentStrategies;

    public Payment processPayment(String bookingId, String userId, double amount, String paymentMethod) {
        logger.info("Processing payment for booking: {}, amount: {}, method: {}",
                bookingId, amount, paymentMethod);

        // Create payment
        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus(PaymentStatus.PROCESSING);

        // Save initial state
        paymentRepository.save(payment);

        // Get payment strategy
        PaymentStrategy strategy = getPaymentStrategy(paymentMethod);
        if (strategy == null) {
            logger.error("Invalid payment method: {}", paymentMethod);
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Invalid payment method: " + paymentMethod);
            paymentRepository.save(payment);
            return payment;
        }

        // Process payment using strategy
        boolean success = strategy.processPayment(payment);

        // Save result
        paymentRepository.save(payment);

        if (success) {
            logger.info("Payment processed successfully for booking: {}", bookingId);
            publishPaymentEvent(payment, "PAYMENT_COMPLETED");
        } else {
            logger.error("Payment failed for booking: {}", bookingId);
            publishPaymentEvent(payment, "PAYMENT_FAILED");
        }

        return payment;
    }

    public Payment refundPayment(String paymentId, double amount, String reason) {
        logger.info("Processing refund for payment: {}, amount: {}", paymentId, amount);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.COMPLETED &&
                payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new RuntimeException("Cannot refund payment with status: " + payment.getStatus());
        }

        if (amount > (payment.getAmount() - payment.getRefundedAmount())) {
            throw new RuntimeException("Refund amount exceeds available balance");
        }

        // Get payment strategy
        PaymentStrategy strategy = getPaymentStrategy(payment.getPaymentMethod());
        if (strategy == null) {
            throw new RuntimeException("Invalid payment method: " + payment.getPaymentMethod());
        }

        // Process refund using strategy
        boolean success = strategy.refund(payment, amount);

        // Save result
        paymentRepository.save(payment);

        if (success) {
            logger.info("Refund processed successfully for payment: {}", paymentId);
            publishPaymentEvent(payment, "REFUND_COMPLETED");
        } else {
            logger.error("Refund failed for payment: {}", paymentId);
            publishPaymentEvent(payment, "REFUND_FAILED");
        }

        return payment;
    }

    public Payment getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Payment getPaymentByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking"));
    }

    public List<Payment> getUserPayments(String userId) {
        return paymentRepository.findByUserId(userId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    private PaymentStrategy getPaymentStrategy(String paymentMethod) {
        return paymentStrategies.get(paymentMethod.toUpperCase());
    }

    private void publishPaymentEvent(Payment payment, String eventType) {
        // Publish event to message queue or event bus
        logger.info("Publishing payment event: {} for payment: {}", eventType, payment.getId());
        // In production: Use Kafka, RabbitMQ, or AWS SNS/SQS
        // eventPublisher.publish(new PaymentEvent(eventType, payment));
    }
}
