package com.example.userservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String userId;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
}
