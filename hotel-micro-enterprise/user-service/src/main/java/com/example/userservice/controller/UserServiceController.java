package com.example.userservice.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserServiceController {

    private final List<Map<String, Object>> users = new ArrayList<>();
    private int id = 1;

    @GetMapping
    public List<Map<String, Object>> getUsers() {
        return users;
    }

    @PostMapping
    public Map<String, Object> addUser(@RequestBody Map<String, Object> body) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", id++);
        user.put("name", body.get("name"));
        user.put("email", body.getOrDefault("email", "N/A"));
        user.put("role", body.getOrDefault("role", "User"));
        users.add(user);
        return user;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        users.removeIf(u -> Objects.equals(u.get("id"), id));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        for (Map<String, Object> u : users) {
            if (Objects.equals(u.get("id"), id)) {
                u.put("name", body.getOrDefault("name", u.get("name")));
                u.put("email", body.getOrDefault("email", u.get("email")));
                u.put("role", body.getOrDefault("role", u.get("role")));
                return u;
            }
        }
        return Map.of("error", "User not found");
    }
}
