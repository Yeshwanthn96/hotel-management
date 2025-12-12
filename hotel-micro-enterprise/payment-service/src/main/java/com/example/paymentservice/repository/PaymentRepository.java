package com.example.paymentservice.repository;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.model.PaymentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByBookingId(String bookingId);

    List<Payment> findByUserId(String userId);

    List<Payment> findByStatus(PaymentStatus status);
}
