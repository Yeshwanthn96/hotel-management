package com.example.paymentservice.strategy;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.model.PaymentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * PayPal payment provider implementation
 */
@Component("PAYPAL")
public class PayPalPaymentStrategy implements PaymentStrategy {
    private static final Logger logger = LoggerFactory.getLogger(PayPalPaymentStrategy.class);

    @Override
    public boolean processPayment(Payment payment) {
        logger.info("Processing PayPal payment for payment ID: {}", payment.getId());

        try {
            // Simulate PayPal API call
            // In production: Use PayPal SDK
            // PayPalAPI api = new PayPalAPI(clientId, secret);
            // api.createPayment(paymentRequest);

            Thread.sleep(1200);

            String transactionId = "paypal_txn_" + UUID.randomUUID().toString().substring(0, 8);
            payment.setTransactionId(transactionId);
            payment.setStatus(PaymentStatus.COMPLETED);

            logger.info("PayPal payment processed successfully. Transaction ID: {}", transactionId);
            return true;

        } catch (Exception e) {
            logger.error("PayPal payment failed for payment {}: {}", payment.getId(), e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("PayPal processing error: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean refund(Payment payment, double amount) {
        logger.info("Processing PayPal refund for payment ID: {}, amount: {}",
                payment.getId(), amount);

        try {
            if (payment.getTransactionId() == null) {
                logger.error("Cannot refund payment without transaction ID");
                return false;
            }

            // Simulate PayPal refund API call
            Thread.sleep(600);

            String refundId = "paypal_refund_" + UUID.randomUUID().toString().substring(0, 8);
            payment.setRefundId(refundId);
            payment.setRefundedAmount(payment.getRefundedAmount() + amount);

            if (payment.getRefundedAmount() >= payment.getAmount()) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else {
                payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            }

            logger.info("PayPal refund processed successfully. Refund ID: {}", refundId);
            return true;

        } catch (Exception e) {
            logger.error("PayPal refund failed for payment {}: {}", payment.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "PAYPAL";
    }
}
