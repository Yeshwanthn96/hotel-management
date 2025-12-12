package com.example.paymentservice.strategy;

import com.example.paymentservice.model.Payment;

/**
 * Strategy interface for payment providers
 */
public interface PaymentStrategy {
    /**
     * Process payment
     * 
     * @param payment Payment to process
     * @return true if successful, false otherwise
     */
    boolean processPayment(Payment payment);

    /**
     * Refund payment
     * 
     * @param payment Payment to refund
     * @param amount  Amount to refund
     * @return true if successful, false otherwise
     */
    boolean refund(Payment payment, double amount);

    /**
     * Get provider name
     */
    String getProviderName();
}
