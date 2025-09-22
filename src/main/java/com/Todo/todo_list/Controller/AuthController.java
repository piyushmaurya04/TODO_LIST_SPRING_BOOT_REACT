package com.Todo.todo_list.Controller;

import com.Todo.todo_list.Entity.User;
import com.Todo.todo_list.Service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173",
        "http://localhost:5174" }, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register new user
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            User user = authService.registerUser(
                    registerRequest.getUsername(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    registerRequest.getFirstName(),
                    registerRequest.getLastName());

            // Auto-login after registration
            authService.createSession(session, user);

            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("user", createUserResponse(user));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Login user
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            User user = authService.authenticateUser(
                    loginRequest.getUsernameOrEmail(),
                    loginRequest.getPassword());

            authService.createSession(session, user);

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", createUserResponse(user));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Logout user
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            authService.logout(session);

            response.put("success", true);
            response.put("message", "Logout successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Logout failed");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get current user info
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        User currentUser = authService.getCurrentUser(session);

        if (currentUser != null) {
            response.put("success", true);
            response.put("user", createUserResponse(currentUser));
            response.put("isAuthenticated", true);
        } else {
            response.put("success", false);
            response.put("message", "Not authenticated");
            response.put("isAuthenticated", false);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Check username availability
     */
    @GetMapping("/check-username/{username}")
    public ResponseEntity<Map<String, Object>> checkUsername(@PathVariable String username) {
        Map<String, Object> response = new HashMap<>();

        boolean isAvailable = authService.isUsernameAvailable(username);

        response.put("available", isAvailable);
        response.put("message", isAvailable ? "Username is available" : "Username already exists");

        return ResponseEntity.ok(response);
    }

    /**
     * Check email availability
     */
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Map<String, Object>> checkEmail(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();

        boolean isAvailable = authService.isEmailAvailable(email);

        response.put("available", isAvailable);
        response.put("message", isAvailable ? "Email is available" : "Email already exists");

        return ResponseEntity.ok(response);
    }

    /**
     * Update user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest updateRequest,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        User currentUser = authService.getCurrentUser(session);
        if (currentUser == null) {
            response.put("success", false);
            response.put("message", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        try {
            User updatedUser = authService.updateUserProfile(
                    currentUser.getId(),
                    updateRequest.getFirstName(),
                    updateRequest.getLastName(),
                    updateRequest.getEmail());

            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", createUserResponse(updatedUser));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Change password
     */
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        User currentUser = authService.getCurrentUser(session);
        if (currentUser == null) {
            response.put("success", false);
            response.put("message", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        try {
            authService.changePassword(
                    currentUser.getId(),
                    changePasswordRequest.getCurrentPassword(),
                    changePasswordRequest.getNewPassword());

            response.put("success", true);
            response.put("message", "Password changed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Create user response object (without sensitive data)
     */
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("fullName", user.getFullName());
        userResponse.put("isActive", user.isActive());
        userResponse.put("createdAt", user.getCreatedAt());
        return userResponse;
    }

    // Request DTOs
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String firstName;
        private String lastName;

        // Getters and setters
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    public static class LoginRequest {
        private String usernameOrEmail;
        private String password;

        // Getters and setters
        public String getUsernameOrEmail() {
            return usernameOrEmail;
        }

        public void setUsernameOrEmail(String usernameOrEmail) {
            this.usernameOrEmail = usernameOrEmail;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String email;

        // Getters and setters
        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        // Getters and setters
        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}