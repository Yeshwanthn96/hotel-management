package com.example.notificationservice.controller;

import com.example.notificationservice.model.UserNotification;
import com.example.notificationservice.repository.UserNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationServiceController {

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    /**
     * Get all notifications for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserNotification>> getUserNotifications(@PathVariable String userId) {
        List<UserNotification> notifications = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notifications count for a user
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        long count = userNotificationRepository.countByUserIdAndReadFalse(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<UserNotification> markAsRead(@PathVariable String notificationId) {
        return userNotificationRepository.findById(notificationId)
                .map(notification -> {
                    notification.setRead(true);
                    userNotificationRepository.save(notification);
                    return ResponseEntity.ok(notification);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@PathVariable String userId) {
        List<UserNotification> unread = userNotificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        userNotificationRepository.saveAll(unread);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    /**
     * Create a notification (internal use - called by booking service)
     */
    @PostMapping
    public ResponseEntity<UserNotification> createNotification(@RequestBody Map<String, String> body) {
        UserNotification notification = new UserNotification(
                body.get("userId"),
                body.get("title"),
                body.get("message"),
                body.get("type"),
                body.get("referenceId"));
        userNotificationRepository.save(notification);
        return ResponseEntity.ok(notification);
    }
}
