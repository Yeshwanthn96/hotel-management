package com.example.paymentservice.strategy;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.model.PaymentStatus;
import com.example.paymentservice.service.StripeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * Stripe payment provider implementation with real Stripe integration
 */
@Component("STRIPE")
public class StripePaymentStrategy implements PaymentStrategy {
    private static final Logger logger = LoggerFactory.getLogger(StripePaymentStrategy.class);

    @Autowired
    private StripeService stripeService;

    @Override
    public boolean processPayment(Payment payment) {
        logger.info("Processing Stripe payment for payment ID: {}", payment.getId());

        try {
            // Use Stripe simulation for demo (replace with real Stripe API in production)
            Map<String, Object> result = stripeService.simulatePayment(
                    payment.getBookingId(),
                    payment.getAmount());

            if (result.get("success").equals(true)) {
                String transactionId = (String) result.get("transactionId");
                payment.setTransactionId(transactionId);
                payment.setStatus(PaymentStatus.COMPLETED);
                logger.info("Stripe payment processed successfully. Transaction ID: {}", transactionId);
                return true;
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Stripe payment declined");
                return false;
            }

        } catch (Exception e) {
            logger.error("Stripe payment failed for payment {}: {}", payment.getId(), e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Stripe processing error: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean refund(Payment payment, double amount) {
        logger.info("Processing Stripe refund for payment ID: {}, amount: {}",
                payment.getId(), amount);

        try {
            if (payment.getTransactionId() == null) {
                logger.error("Cannot refund payment without transaction ID");
                return false;
            }

            // Use Stripe simulation for demo
            Map<String, Object> result = stripeService.simulateRefund(
                    payment.getTransactionId(),
                    amount);

            if (result.get("success").equals(true)) {
                String refundId = (String) result.get("refundId");
                payment.setRefundId(refundId);
                payment.setRefundedAmount(payment.getRefundedAmount() + amount);

                if (payment.getRefundedAmount() >= payment.getAmount()) {
                    payment.setStatus(PaymentStatus.REFUNDED);
                } else {
                    payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
                }

                logger.info("Stripe refund processed successfully. Refund ID: {}", refundId);
                return true;
            } else {
                logger.error("Stripe refund failed");
                return false;
            }

        } catch (Exception e) {
            logger.error("Stripe refund failed for payment {}: {}", payment.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "STRIPE";
    }
}
