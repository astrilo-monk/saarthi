package com.saarthi.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Forum Post entity.
 * Posts can be campus-scoped (filtered by collegeId) or global.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumPost {
    private String id;
    private String title;
    private String content;
    private String category;         // anxiety, exams, relationships, loneliness, general
    private String userId;           // internal user id
    private String anonymousAuthor;  // display name (e.g. "CalmPanda42")
    private String collegeId;        // nullable - null means global post
    private String collegeName;      // denormalized
    private PostScope scope;         // CAMPUS or GLOBAL
    private LocalDateTime createdAt;

    @Builder.Default
    private List<ForumComment> comments = new ArrayList<>();

    @Builder.Default
    private int commentCount = 0;

    public enum PostScope {
        CAMPUS,
        GLOBAL
    }
}
