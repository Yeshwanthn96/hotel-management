package com.example.paymentservice.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {
    private static final Logger logger = LoggerFactory.getLogger(StripeService.class);

    @Value("${stripe.api.key:sk_test_51234567890abcdefghijklmnop}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        // In production, use real Stripe API key from environment variable
        // For demo, we'll use test mode
        Stripe.apiKey = stripeApiKey;
        logger.info("Stripe service initialized with test mode");
    }

    /**
     * Create a Payment Intent for card payments
     */
    public PaymentIntent createPaymentIntent(String bookingId, double amount, String currency, String customerId) {
        try {
            // Convert amount to cents (Stripe requires amounts in smallest currency unit)
            long amountInCents = (long) (amount * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency.toLowerCase())
                    .addPaymentMethodType("card")
                    .putMetadata("booking_id", bookingId)
                    .putMetadata("customer_id", customerId)
                    .setDescription("Hotel Booking Payment - " + bookingId)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            logger.info("Stripe Payment Intent created: {}", paymentIntent.getId());
            return paymentIntent;

        } catch (StripeException e) {
            logger.error("Stripe Payment Intent creation failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Confirm a Payment Intent
     */
    public PaymentIntent confirmPaymentIntent(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            paymentIntent = paymentIntent.confirm();
            logger.info("Payment Intent confirmed: {}", paymentIntentId);
            return paymentIntent;
        } catch (StripeException e) {
            logger.error("Payment Intent confirmation failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Create a refund for a payment
     */
    public Refund createRefund(String paymentIntentId, long amountInCents, String reason) {
        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .setAmount(amountInCents)
                    .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
                    .putMetadata("reason", reason)
                    .build();

            Refund refund = Refund.create(params);
            logger.info("Stripe Refund created: {}", refund.getId());
            return refund;

        } catch (StripeException e) {
            logger.error("Stripe Refund creation failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get Payment Intent details
     */
    public PaymentIntent getPaymentIntent(String paymentIntentId) {
        try {
            return PaymentIntent.retrieve(paymentIntentId);
        } catch (StripeException e) {
            logger.error("Failed to retrieve Payment Intent: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Simulate payment for demo purposes (when Stripe test keys aren't available)
     */
    public Map<String, Object> simulatePayment(String bookingId, double amount) {
        Map<String, Object> result = new HashMap<>();

        // Simulate payment processing delay
        try {
            Thread.sleep(1500); // 1.5 seconds delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Generate a fake transaction ID
        String transactionId = "pi_" + System.currentTimeMillis() + "_" + bookingId;

        result.put("success", true);
        result.put("transactionId", transactionId);
        result.put("amount", amount);
        result.put("currency", "USD");
        result.put("status", "succeeded");
        result.put("payment_method", "card_****4242");

        logger.info("Simulated payment completed: {}", transactionId);
        return result;
    }

    /**
     * Simulate refund for demo purposes
     */
    public Map<String, Object> simulateRefund(String transactionId, double amount) {
        Map<String, Object> result = new HashMap<>();

        // Simulate refund processing delay
        try {
            Thread.sleep(1000); // 1 second delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String refundId = "re_" + System.currentTimeMillis();

        result.put("success", true);
        result.put("refundId", refundId);
        result.put("amount", amount);
        result.put("status", "succeeded");
        result.put("original_transaction", transactionId);

        logger.info("Simulated refund completed: {}", refundId);
        return result;
    }
}
