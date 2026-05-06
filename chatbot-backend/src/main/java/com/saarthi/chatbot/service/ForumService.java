package com.saarthi.chatbot.service;

import com.saarthi.chatbot.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Forum Service
 *
 * In-memory forum post and comment storage.
 * Supports campus-scoped and global posts.
 */
@Slf4j
@Service
public class ForumService {

    private final Map<String, ForumPost> posts = new ConcurrentHashMap<>();
    private final AuthService authService;

    public static final List<String> CATEGORIES = List.of(
            "anxiety", "exams", "relationships", "loneliness", "general"
    );

    public ForumService(AuthService authService) {
        this.authService = authService;
        seedPosts();
    }

    /**
     * Get posts filtered by scope and optional collegeId.
     */
    public List<ForumPost> getPosts(String scope, String collegeId, String category) {
        return posts.values().stream()
                .filter(post -> {
                    // Scope filter
                    if ("campus".equalsIgnoreCase(scope)) {
                        return post.getScope() == ForumPost.PostScope.CAMPUS
                                && Objects.equals(post.getCollegeId(), collegeId);
                    } else {
                        return post.getScope() == ForumPost.PostScope.GLOBAL;
                    }
                })
                .filter(post -> {
                    // Category filter
                    if (category != null && !category.isEmpty() && !"all".equalsIgnoreCase(category)) {
                        return category.equalsIgnoreCase(post.getCategory());
                    }
                    return true;
                })
                .sorted(Comparator.comparing(ForumPost::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Get a single post by ID with comments.
     */
    public ForumPost getPost(String postId) {
        return posts.get(postId);
    }

    /**
     * Create a new forum post.
     */
    public ForumPost createPost(String title, String content, String category,
                                 String scope, User user) {
        ForumPost.PostScope postScope = "campus".equalsIgnoreCase(scope)
                ? ForumPost.PostScope.CAMPUS
                : ForumPost.PostScope.GLOBAL;

        // Only COLLEGE_USER can create campus posts
        if (postScope == ForumPost.PostScope.CAMPUS && user.getRole() != User.UserRole.COLLEGE_USER) {
            throw new IllegalArgumentException("Only college users can create campus posts");
        }

        ForumPost post = ForumPost.builder()
                .id(UUID.randomUUID().toString())
                .title(title.trim())
                .content(content.trim())
                .category(category.toLowerCase())
                .userId(user.getId())
                .anonymousAuthor(user.getAnonymousName())
                .collegeId(postScope == ForumPost.PostScope.CAMPUS ? user.getCollegeId() : null)
                .collegeName(postScope == ForumPost.PostScope.CAMPUS ? user.getCollegeName() : null)
                .scope(postScope)
                .createdAt(LocalDateTime.now())
                .comments(new ArrayList<>())
                .commentCount(0)
                .build();

        posts.put(post.getId(), post);
        log.info("Created {} post '{}' by {}", postScope, title, user.getAnonymousName());

        return post;
    }

    /**
     * Add a comment to a post.
     */
    public ForumComment addComment(String postId, String content, User user) {
        ForumPost post = posts.get(postId);
        if (post == null) {
            throw new IllegalArgumentException("Post not found");
        }

        // Access control: campus posts only accessible by same college
        if (post.getScope() == ForumPost.PostScope.CAMPUS) {
            if (user.getRole() != User.UserRole.COLLEGE_USER
                    || !Objects.equals(user.getCollegeId(), post.getCollegeId())) {
                throw new IllegalArgumentException("You don't have access to this campus post");
            }
        }

        ForumComment comment = ForumComment.builder()
                .id(UUID.randomUUID().toString())
                .postId(postId)
                .content(content.trim())
                .userId(user.getId())
                .anonymousAuthor(user.getAnonymousName())
                .createdAt(LocalDateTime.now())
                .build();

        post.getComments().add(comment);
        post.setCommentCount(post.getComments().size());

        log.info("Added comment to post '{}' by {}", post.getTitle(), user.getAnonymousName());
        return comment;
    }

    /**
     * Seed some starter posts so the forum isn't empty.
     */
    private void seedPosts() {
        // Global posts
        List<String[]> examComments = new ArrayList<>();
        examComments.add(new String[]{"SereneRobin88", "I found that breaking study sessions into smaller chunks really helps. Try the Pomodoro technique — 25 minutes of focused study, then a 5-minute break."});
        examComments.add(new String[]{"BraveDolphin45", "Deep breathing exercises before exams have been a game-changer for me. Even just 3 minutes of box breathing helps."});
        createSeedPost("Dealing with exam anxiety - any tips?",
                "I have my finals coming up and I'm feeling really overwhelmed. The anxiety is making it hard to focus on studying. Has anyone found effective ways to manage exam stress?",
                "anxiety", ForumPost.PostScope.GLOBAL, "CalmOwl217", null, null,
                examComments);

        List<String[]> sleepComments = new ArrayList<>();
        sleepComments.add(new String[]{"WisePenguin31", "I use a journal to write down all my thoughts before bed. It helps get them out of my head so I can relax."});
        createSeedPost("Trouble sleeping before important deadlines",
                "Anyone else find it impossible to sleep when you have big assignments due? My mind just keeps racing with all the things I need to do.",
                "anxiety", ForumPost.PostScope.GLOBAL, "QuietFox92", null, null,
                sleepComments);

        List<String[]> groupComments = new ArrayList<>();
        groupComments.add(new String[]{"KindButterfly73", "Start small — maybe suggest meeting in a quiet coffee shop instead of a busy library. Smaller, calmer environments help me feel more comfortable."});
        createSeedPost("Social anxiety in group projects",
                "Group projects make me so anxious. I worry about speaking up and being judged. How do you handle working with classmates when you have social anxiety?",
                "relationships", ForumPost.PostScope.GLOBAL, "GentleSparrow56", null, null,
                groupComments);

        createSeedPost("Feeling lonely even when surrounded by people",
                "I'm always around classmates and friends but still feel so disconnected. Does anyone else experience this? How do you cope?",
                "loneliness", ForumPost.PostScope.GLOBAL, "HopefulDeer88", null, null,
                new ArrayList<>());

        log.info("Seeded {} forum posts", posts.size());
    }

    private void createSeedPost(String title, String content, String category,
                                 ForumPost.PostScope scope, String author,
                                 String collegeId, String collegeName,
                                 List<String[]> commentData) {
        List<ForumComment> comments = new ArrayList<>();
        for (int i = 0; i < commentData.size(); i++) {
            String[] cd = commentData.get(i);
            comments.add(ForumComment.builder()
                    .id(UUID.randomUUID().toString())
                    .postId("")  // will be set below
                    .content(cd[1])
                    .userId("seed-" + i)
                    .anonymousAuthor(cd[0])
                    .createdAt(LocalDateTime.now().minusHours(i + 1))
                    .build());
        }

        ForumPost post = ForumPost.builder()
                .id(UUID.randomUUID().toString())
                .title(title)
                .content(content)
                .category(category)
                .userId("seed-author")
                .anonymousAuthor(author)
                .collegeId(collegeId)
                .collegeName(collegeName)
                .scope(scope)
                .createdAt(LocalDateTime.now().minusHours(comments.size() + 2))
                .comments(comments)
                .commentCount(comments.size())
                .build();

        // Fix post IDs in comments
        for (ForumComment c : comments) {
            c.setPostId(post.getId());
        }

        posts.put(post.getId(), post);
    }
}
