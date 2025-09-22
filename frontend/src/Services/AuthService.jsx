class AuthService {
    constructor() {
        // Use relative URL for production (same server) or localhost for development
        this.API_URL = process.env.NODE_ENV === 'production' ? "/api/auth" : "http://localhost:8080/api/auth";
    }

    // Helper method to make API requests with proper credentials
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            credentials: 'include', // Important for session cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        return response;
    }

    // Login user
    async login(usernameOrEmail, password) {
        try {
            const response = await this.makeRequest(`${this.API_URL}/login`, {
                method: 'POST',
                body: JSON.stringify({
                    usernameOrEmail,
                    password,
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await this.makeRequest(`${this.API_URL}/register`, {
                method: 'POST',
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    // Logout user
    async logout() {
        try {
            const response = await this.makeRequest(`${this.API_URL}/logout`, {
                method: 'POST',
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, message: 'Logout failed' };
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const response = await this.makeRequest(`${this.API_URL}/me`, {
                method: 'GET',
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get current user error:', error);
            return { success: false, message: 'Failed to get user info' };
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            const response = await this.makeRequest(`${this.API_URL}/profile`, {
                method: 'PUT',
                body: JSON.stringify(profileData),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: 'Profile update failed' };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.makeRequest(`${this.API_URL}/change-password`, {
                method: 'PUT',
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: 'Password change failed' };
        }
    }

    // Check username availability
    async checkUsername(username) {
        try {
            const response = await this.makeRequest(`${this.API_URL}/check-username/${encodeURIComponent(username)}`, {
                method: 'GET',
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Username check error:', error);
            return { available: false, message: 'Username check failed' };
        }
    }

    // Check email availability
    async checkEmail(email) {
        try {
            const response = await this.makeRequest(`${this.API_URL}/check-email/${encodeURIComponent(email)}`, {
                method: 'GET',
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Email check error:', error);
            return { available: false, message: 'Email check failed' };
        }
    }

    // Validate username
    validateUsername(username) {
        if (username.length < 3) {
            return { valid: false, message: 'Username must be at least 3 characters long' };
        }

        if (username.length > 50) {
            return { valid: false, message: 'Username must not exceed 50 characters' };
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return { valid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
        }

        return { valid: true, message: 'Username is valid' };
    }

    // Validate email format (instance method)
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength (instance method)
    validatePassword(password) {
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }

        if (!/(?=.*[a-z])/.test(password)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }

        if (!/(?=.*\d)/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }

        return { valid: true, message: 'Password is strong' };
    }
}

export default new AuthService();