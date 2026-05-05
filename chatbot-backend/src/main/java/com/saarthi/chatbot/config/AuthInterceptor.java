package com.saarthi.chatbot.config;

import com.saarthi.chatbot.model.User;
import com.saarthi.chatbot.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Authentication Interceptor
 *
 * Enforces that write operations (POST) on protected endpoints
 * require a valid auth token. Extracts user and sets it as a request
 * attribute for controllers to use.
 *
 * Read operations (GET) are generally open for the global forum.
 */
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    public AuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {
        // Allow preflight CORS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Only enforce on write operations (POST, PUT, DELETE)
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || authHeader.isEmpty()) {
            log.warn("Blocked unauthenticated {} to {}", request.getMethod(), request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Authentication required\"}");
            return false;
        }

        User user = authService.getUserByToken(authHeader);
        if (user == null) {
            log.warn("Blocked invalid token for {} to {}", request.getMethod(), request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
            return false;
        }

        // Store user in request for downstream use
        request.setAttribute("authenticatedUser", user);
        return true;
    }
}
