package com.example.bookingservice.saga;

import com.example.bookingservice.model.Booking;
import java.util.HashMap;
import java.util.Map;

public class SagaContext {
    private Booking booking;
    private String paymentMethod;
    private Map<String, Object> data;
    private boolean compensating;
    private String errorMessage;

    public SagaContext(Booking booking, String paymentMethod) {
        this.booking = booking;
        this.paymentMethod = paymentMethod;
        this.data = new HashMap<>();
        this.compensating = false;
        this.errorMessage = null;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void putData(String key, Object value) {
        this.data.put(key, value);
    }

    public Object getData(String key) {
        return this.data.get(key);
    }

    public boolean isCompensating() {
        return compensating;
    }

    public void setCompensating(boolean compensating) {
        this.compensating = compensating;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
