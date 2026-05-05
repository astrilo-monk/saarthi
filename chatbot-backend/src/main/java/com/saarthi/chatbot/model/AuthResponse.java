package com.saarthi.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response - returned after successful login.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;           // simple session token
    private String userId;
    private String email;
    private User.UserRole role;
    private String collegeId;
    private String collegeName;
    private String anonymousName;
}
