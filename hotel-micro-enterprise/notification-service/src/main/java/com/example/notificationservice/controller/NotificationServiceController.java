package com.example.notificationservice.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationServiceController {

    private final List<Map<String, Object>> notifications = new ArrayList<>();
    private int id = 1;

    @GetMapping
    public List<Map<String, Object>> getNotifications() {
        return notifications;
    }

    @PostMapping
    public Map<String, Object> add(@RequestBody Map<String, Object> body) {
        Map<String, Object> note = new HashMap<>();
        note.put("id", id++);
        note.put("title", body.get("title"));
        note.put("message", body.get("message"));
        note.put("type", body.get("type"));
        notifications.add(note);
        return note;
    }
}
