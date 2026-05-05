package com.saarthi.chatbot.service;

import com.saarthi.chatbot.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authentication Service
 *
 * Handles domain-based authentication:
 * - If email domain matches a registered college → COLLEGE_USER with collegeId
 * - Otherwise → PUBLIC_USER
 *
 * Uses in-memory storage (ConcurrentHashMap) for simplicity.
 * Can be replaced with a database later.
 */
@Slf4j
@Service
public class AuthService {

    // In-memory user store: token → User
    private final Map<String, User> tokenStore = new ConcurrentHashMap<>();
    // email → User for dedup
    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();

    // Registered colleges with their email domains
    private final List<College> registeredColleges;

    // Anonymous name generation
    private static final String[] ADJECTIVES = {
        "Calm", "Brave", "Kind", "Gentle", "Wise", "Hopeful", "Strong", "Bright",
        "Serene", "Steady", "Warm", "Quiet", "Bold", "Free", "Light", "Clear",
        "Peaceful", "Resilient", "Mindful", "Patient", "Graceful", "Radiant"
    };

    private static final String[] NOUNS = {
        "Panda", "Owl", "Dolphin", "Phoenix", "Sparrow", "Butterfly", "Fox",
        "Penguin", "Robin", "Dove", "Turtle", "Deer", "Otter", "Swan",
        "Eagle", "Hummingbird", "Koala", "Rabbit", "Falcon", "Starling"
    };

    private final Random random = new Random();

    public AuthService() {
        // Initialize with registered colleges
        this.registeredColleges = new ArrayList<>();
        registeredColleges.add(College.builder().id("col-1").name("BPPIMT").domain("bppimt.ac.in").build());
        registeredColleges.add(College.builder().id("col-2").name("IIT Kharagpur").domain("iitkgp.ac.in").build());
        registeredColleges.add(College.builder().id("col-3").name("Jadavpur University").domain("jadavpuruniversity.in").build());
        registeredColleges.add(College.builder().id("col-4").name("NIT Durgapur").domain("nitdgp.ac.in").build());
        registeredColleges.add(College.builder().id("col-5").name("IIEST Shibpur").domain("iiests.ac.in").build());

        log.info("AuthService initialized with {} registered colleges", registeredColleges.size());
    }

    /**
     * Authenticate user by email.
     * Creates or retrieves user, assigns role based on domain.
     *
     * @param request AuthRequest with email
     * @return AuthResponse with token and user data
     */
    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String domain = email.substring(email.indexOf('@') + 1);

        log.info("Login attempt for domain: {}", domain);

        // Check if user already exists
        User existingUser = usersByEmail.get(email);
        if (existingUser != null) {
            existingUser.setLastLoginAt(LocalDateTime.now());
            String token = generateToken();
            tokenStore.put(token, existingUser);

            log.info("Returning user: {} ({})", existingUser.getAnonymousName(), existingUser.getRole());
            return buildAuthResponse(token, existingUser);
        }

        // Determine role based on domain
        College matchedCollege = findCollegeByDomain(domain);
        User.UserRole role = matchedCollege != null ? User.UserRole.COLLEGE_USER : User.UserRole.PUBLIC_USER;

        // Create new user
        User newUser = User.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .role(role)
                .collegeId(matchedCollege != null ? matchedCollege.getId() : null)
                .collegeName(matchedCollege != null ? matchedCollege.getName() : null)
                .anonymousName(generateAnonymousName())
                .createdAt(LocalDateTime.now())
                .lastLoginAt(LocalDateTime.now())
                .build();

        // Store user
        usersByEmail.put(email, newUser);
        String token = generateToken();
        tokenStore.put(token, newUser);

        log.info("Created new user: {} ({}) for college: {}",
                newUser.getAnonymousName(), role,
                matchedCollege != null ? matchedCollege.getName() : "N/A");

        return buildAuthResponse(token, newUser);
    }

    /**
     * Get user by session token.
     *
     * @param token Session token
     * @return User or null if invalid
     */
    public User getUserByToken(String token) {
        if (token == null || token.isEmpty()) return null;
        // Strip "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return tokenStore.get(token);
    }

    /**
     * Logout - invalidate token.
     */
    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        tokenStore.remove(token);
    }

    /**
     * Get all registered colleges.
     */
    public List<College> getRegisteredColleges() {
        return Collections.unmodifiableList(registeredColleges);
    }

    // --- Private helpers ---

    private College findCollegeByDomain(String domain) {
        return registeredColleges.stream()
                .filter(c -> c.getDomain().equalsIgnoreCase(domain))
                .findFirst()
                .orElse(null);
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }

    private String generateAnonymousName() {
        String adj = ADJECTIVES[random.nextInt(ADJECTIVES.length)];
        String noun = NOUNS[random.nextInt(NOUNS.length)];
        int num = random.nextInt(999) + 1;
        return adj + noun + num;
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .collegeId(user.getCollegeId())
                .collegeName(user.getCollegeName())
                .anonymousName(user.getAnonymousName())
                .build();
    }
}
