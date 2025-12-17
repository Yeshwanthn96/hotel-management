package com.example.notificationservice.repository;

import com.example.notificationservice.model.UserNotification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserNotificationRepository extends MongoRepository<UserNotification, String> {

    List<UserNotification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<UserNotification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);

    long countByUserIdAndReadFalse(String userId);
}
