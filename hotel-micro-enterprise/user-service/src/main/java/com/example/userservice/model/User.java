package com.example.userservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String firstName;

    private String lastName;

    @Indexed(unique = true)
    private String email;

    private String phone;

    private String password; // Will be encrypted

    private String role; // admin, manager, user

    private boolean active;

    private String resetToken;

    private LocalDateTime resetTokenExpiry;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
