package com.saarthi.chatbot.controller;

import com.saarthi.chatbot.model.*;
import com.saarthi.chatbot.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Authentication Controller
 *
 * Endpoints:
 * POST /api/auth/login    - Login with email, get token + role
 * GET  /api/auth/me       - Get current user from token
 * POST /api/auth/logout   - Invalidate token
 * GET  /api/auth/colleges - List registered colleges
 */
@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login with email.
     * Domain is checked against registered colleges to assign role.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login request for email: {}", request.getEmail());

        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get current user from Authorization header token.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || authHeader.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No authorization token provided"));
        }

        User user = authService.getUserByToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        Map<String, Object> userData = new HashMap<>();
        userData.put("userId", user.getId());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        userData.put("collegeId", user.getCollegeId());
        userData.put("collegeName", user.getCollegeName());
        userData.put("anonymousName", user.getAnonymousName());

        return ResponseEntity.ok(userData);
    }

    /**
     * Logout - invalidate the session token.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null) {
            authService.logout(authHeader);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * List all registered colleges.
     * Used by frontend to show which domains are supported.
     */
    @GetMapping("/colleges")
    public ResponseEntity<List<College>> getColleges() {
        return ResponseEntity.ok(authService.getRegisteredColleges());
    }
}
