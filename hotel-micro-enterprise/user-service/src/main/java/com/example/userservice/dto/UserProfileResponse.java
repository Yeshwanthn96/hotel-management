package com.example.userservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private boolean active;
}
