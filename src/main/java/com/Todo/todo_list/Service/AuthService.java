package com.Todo.todo_list.Service;

import com.Todo.todo_list.Entity.User;
import com.Todo.todo_list.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpSession;
import java.util.Optional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String SESSION_USER_KEY = "user";

    /**
     * Register a new user
     */
    public User registerUser(String username, String email, String password,
            String firstName, String lastName) {

        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setActive(true);

        return userRepository.save(user);
    }

    /**
     * Authenticate user login
     */
    public User authenticateUser(String usernameOrEmail, String password) {
        // Find user by username or email
        Optional<User> userOptional = userRepository.findByUsernameOrEmail(
                usernameOrEmail, usernameOrEmail);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOptional.get();

        // Check if user is active
        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }

    /**
     * Create user session
     */
    public void createSession(HttpSession session, User user) {
        session.setAttribute(SESSION_USER_KEY, user.getId());
        session.setMaxInactiveInterval(24 * 60 * 60); // 24 hours

        // Set Spring Security context
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                null,
                java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    /**
     * Get current user from session
     */
    public User getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute(SESSION_USER_KEY);

        if (userId == null) {
            return null;
        }

        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty() || !userOptional.get().isActive()) {
            // Invalid user or deactivated, clear session and security context
            session.removeAttribute(SESSION_USER_KEY);
            SecurityContextHolder.getContext().setAuthentication(null);
            return null;
        }

        User user = userOptional.get();

        // Ensure Spring Security context is set if not already
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(),
                    null,
                    java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        return user;
    }

    /**
     * Check if user is logged in
     */
    public boolean isLoggedIn(HttpSession session) {
        Long userId = (Long) session.getAttribute(SESSION_USER_KEY);

        if (userId == null) {
            return false;
        }

        Optional<User> userOptional = userRepository.findById(userId);
        return userOptional.isPresent() && userOptional.get().isActive();
    }

    /**
     * Logout user
     */
    public void logout(HttpSession session) {
        session.removeAttribute(SESSION_USER_KEY);
        session.invalidate();
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    /**
     * Update user profile
     */
    public User updateUserProfile(Long userId, String firstName, String lastName, String email) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Check if email is being changed and if it already exists
        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);

        return userRepository.save(user);
    }

    /**
     * Change password
     */
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Get user by username
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    /**
     * Check username availability
     */
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    /**
     * Check email availability
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
}