package com.saarthi.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User entity for domain-based authentication.
 * Users are assigned roles based on their email domain.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String email;
    private UserRole role;
    private String collegeId;       // nullable - only for COLLEGE_USER
    private String collegeName;     // denormalized for convenience
    private String anonymousName;   // auto-generated anonymous display name
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    public enum UserRole {
        COLLEGE_USER,
        PUBLIC_USER
    }
}
