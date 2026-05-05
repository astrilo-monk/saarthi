package com.saarthi.chatbot.controller;

import com.saarthi.chatbot.model.*;
import com.saarthi.chatbot.service.AuthService;
import com.saarthi.chatbot.service.ForumService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Forum Controller
 *
 * Endpoints:
 * GET  /api/forum/posts            - List posts (scope=campus|global, category=...)
 * GET  /api/forum/posts/{id}       - Get single post with comments
 * POST /api/forum/posts            - Create a new post
 * POST /api/forum/posts/{id}/comments - Add a comment to a post
 * GET  /api/forum/categories       - List available categories
 */
@Slf4j
@RestController
@RequestMapping("/forum")
@CrossOrigin(origins = {"http://localhost:4321", "http://localhost:5173", "http://localhost:3000"})
public class ForumController {

    private final ForumService forumService;
    private final AuthService authService;

    public ForumController(ForumService forumService, AuthService authService) {
        this.forumService = forumService;
        this.authService = authService;
    }

    /**
     * List posts filtered by scope and category.
     */
    @GetMapping("/posts")
    public ResponseEntity<?> getPosts(
            @RequestParam(defaultValue = "global") String scope,
            @RequestParam(required = false) String category,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String collegeId = null;

        // For campus scope, require authentication and extract collegeId
        if ("campus".equalsIgnoreCase(scope)) {
            User user = authService.getUserByToken(authHeader);
            if (user == null || user.getRole() != User.UserRole.COLLEGE_USER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Campus forum requires a college account"));
            }
            collegeId = user.getCollegeId();
        }

        List<ForumPost> posts = forumService.getPosts(scope, collegeId, category);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get a single post with all comments.
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPost(@PathVariable String id) {
        ForumPost post = forumService.getPost(id);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(post);
    }

    /**
     * Create a new post.
     */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User user = authService.getUserByToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "You must be signed in to create a post"));
        }

        String title = body.get("title");
        String content = body.get("content");
        String category = body.getOrDefault("category", "general");
        String scope = body.getOrDefault("scope", "global");

        if (title == null || title.trim().isEmpty() || content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Title and content are required"));
        }

        try {
            ForumPost post = forumService.createPost(title, content, category, scope, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(post);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add a comment to a post.
     */
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User user = authService.getUserByToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "You must be signed in to comment"));
        }

        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Comment content is required"));
        }

        try {
            ForumComment comment = forumService.addComment(id, content, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * List available categories.
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(ForumService.CATEGORIES);
    }
}
