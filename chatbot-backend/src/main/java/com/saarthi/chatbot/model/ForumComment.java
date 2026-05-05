package com.saarthi.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Forum Comment entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumComment {
    private String id;
    private String postId;
    private String content;
    private String userId;
    private String anonymousAuthor;
    private LocalDateTime createdAt;
}
