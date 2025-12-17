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
     * Get all unique notifications (admin use) - shows distinct notifications, not
     * per-user copies
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllNotifications() {
        List<UserNotification> allNotifications = userNotificationRepository.findAll();

        // Group notifications by title+message+type+date (within 1 second) to show
        // unique broadcasts
        Map<String, Map<String, Object>> uniqueNotifications = new LinkedHashMap<>();

        for (UserNotification notification : allNotifications) {
            // Create a time-based key (rounded to nearest second for grouping)
            String timeKey = notification.getCreatedAt() != null ? notification.getCreatedAt().withNano(0).toString()
                    : "unknown";
            String key = notification.getTitle() + "|" + notification.getMessage() + "|" +
                    notification.getType() + "|" + timeKey;

            if (!uniqueNotifications.containsKey(key)) {
                Map<String, Object> notifMap = new HashMap<>();
                notifMap.put("id", notification.getId());
                notifMap.put("title", notification.getTitle());
                notifMap.put("message", notification.getMessage());
                notifMap.put("type", notification.getType());
                notifMap.put("createdAt", notification.getCreatedAt());
                notifMap.put("recipientCount", 1);
                List<String> userIds = new ArrayList<>();
                userIds.add(notification.getUserId());
                notifMap.put("userIds", userIds);
                uniqueNotifications.put(key, notifMap);
            } else {
                // Increment recipient count and add user ID
                Map<String, Object> existing = uniqueNotifications.get(key);
                existing.put("recipientCount", (Integer) existing.get("recipientCount") + 1);
                @SuppressWarnings("unchecked")
                List<String> userIds = (List<String>) existing.get("userIds");
                userIds.add(notification.getUserId());
            }
        }

        // Convert to list and sort by createdAt descending
        List<Map<String, Object>> result = new ArrayList<>(uniqueNotifications.values());
        result.sort((a, b) -> {
            java.time.LocalDateTime dateA = (java.time.LocalDateTime) a.get("createdAt");
            java.time.LocalDateTime dateB = (java.time.LocalDateTime) b.get("createdAt");
            if (dateA == null || dateB == null)
                return 0;
            return dateB.compareTo(dateA);
        });

        return ResponseEntity.ok(result);
    }

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

    /**
     * Send bulk notification to all users (Admin only)
     */
    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> sendBulkNotification(@RequestBody Map<String, String> body) {
        try {
            String title = body.get("title");
            String message = body.get("message");
            String type = body.getOrDefault("type", "info");

            if (title == null || message == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Title and message are required"));
            }

            // Get all user IDs from user-service
            org.springframework.web.reactive.function.client.WebClient webClient = org.springframework.web.reactive.function.client.WebClient
                    .create("http://localhost:8091");

            Map<String, Object> response = webClient.get()
                    .uri("/api/users/internal/user-ids")
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();

            if (response == null || !response.containsKey("userIds")) {
                return ResponseEntity.ok(Map.of("message", "No users found", "count", 0));
            }

            List<String> userIds = (List<String>) response.get("userIds");

            if (userIds == null || userIds.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "No users found", "count", 0));
            }

            // Create notifications for all users
            List<UserNotification> notifications = new ArrayList<>();
            for (String userId : userIds) {
                UserNotification notification = new UserNotification(
                        userId,
                        title,
                        message,
                        type,
                        null);
                notifications.add(notification);
            }

            userNotificationRepository.saveAll(notifications);

            return ResponseEntity.ok(Map.of(
                    "message", "Notification sent to all users",
                    "count", notifications.size()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to send bulk notification: " + e.getMessage()));
        }
    }

    /**
     * Delete a single notification by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String id) {
        try {
            Optional<UserNotification> notification = userNotificationRepository.findById(id);
            if (notification.isPresent()) {
                userNotificationRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
            }
            return ResponseEntity.status(404).body(Map.of("error", "Notification not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to delete notification: " + e.getMessage()));
        }
    }

    /**
     * Delete notifications by reference ID (e.g., when a review is deleted)
     */
    @DeleteMapping("/reference/{referenceId}")
    public ResponseEntity<Map<String, Object>> deleteByReferenceId(@PathVariable String referenceId) {
        try {
            List<UserNotification> notifications = userNotificationRepository.findByReferenceId(referenceId);
            if (!notifications.isEmpty()) {
                userNotificationRepository.deleteAll(notifications);
                return ResponseEntity.ok(Map.of(
                        "message", "Notifications deleted successfully",
                        "count", notifications.size()));
            }
            return ResponseEntity.ok(Map.of("message", "No notifications found for this reference", "count", 0));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to delete notifications: " + e.getMessage()));
        }
    }
}
