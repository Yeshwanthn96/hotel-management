package com.example.notificationservice.repository;

import com.example.notificationservice.model.NotificationLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends MongoRepository<NotificationLog, String> {

    List<NotificationLog> findByRecipient(String recipient);

    List<NotificationLog> findByType(String type);

    List<NotificationLog> findByStatus(String status);

    List<NotificationLog> findBySentAtBetween(LocalDateTime start, LocalDateTime end);
}
