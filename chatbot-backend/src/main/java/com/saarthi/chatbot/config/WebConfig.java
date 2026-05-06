package com.saarthi.chatbot.config;

import com.saarthi.chatbot.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration for CORS and auth interceptors.
 * Centralizes cross-cutting concerns instead of per-controller @CrossOrigin.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthService authService;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    public WebConfig(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = allowedOrigins.split(",");
        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuthInterceptor(authService))
                .addPathPatterns("/forum/posts")       // POST create post
                .addPathPatterns("/forum/posts/*/comments"); // POST add comment
        // Auth and chat endpoints handle their own validation
    }
}
