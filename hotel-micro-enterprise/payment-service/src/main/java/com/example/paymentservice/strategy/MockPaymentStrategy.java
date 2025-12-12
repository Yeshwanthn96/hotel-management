package com.example.paymentservice.strategy;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.model.PaymentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Random;
import java.util.UUID;

/**
 * Mock payment provider for testing
 */
@Component("MOCK")
public class MockPaymentStrategy implements PaymentStrategy {
    private static final Logger logger = LoggerFactory.getLogger(MockPaymentStrategy.class);
    private final Random random = new Random();

    @Override
    public boolean processPayment(Payment payment) {
        logger.info("Processing Mock payment for payment ID: {}", payment.getId());

        try {
            // Simulate processing delay
            Thread.sleep(500);

            // 90% success rate for testing
            boolean success = random.nextInt(100) < 90;

            if (success) {
                String transactionId = "mock_txn_" + UUID.randomUUID().toString().substring(0, 8);
                payment.setTransactionId(transactionId);
                payment.setStatus(PaymentStatus.COMPLETED);
                logger.info("Mock payment processed successfully. Transaction ID: {}", transactionId);
                return true;
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Mock payment randomly failed (testing)");
                logger.warn("Mock payment failed (simulated failure)");
                return false;
            }

        } catch (Exception e) {
            logger.error("Mock payment error for payment {}: {}", payment.getId(), e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Mock payment error: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean refund(Payment payment, double amount) {
        logger.info("Processing Mock refund for payment ID: {}, amount: {}",
                payment.getId(), amount);

        try {
            if (payment.getTransactionId() == null) {
                logger.error("Cannot refund payment without transaction ID");
                return false;
            }

            Thread.sleep(300);

            String refundId = "mock_refund_" + UUID.randomUUID().toString().substring(0, 8);
            payment.setRefundId(refundId);
            payment.setRefundedAmount(payment.getRefundedAmount() + amount);

            if (payment.getRefundedAmount() >= payment.getAmount()) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else {
                payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            }

            logger.info("Mock refund processed successfully. Refund ID: {}", refundId);
            return true;

        } catch (Exception e) {
            logger.error("Mock refund failed for payment {}: {}", payment.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "MOCK";
    }
}
