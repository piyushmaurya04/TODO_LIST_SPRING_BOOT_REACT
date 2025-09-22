import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const API_URL = process.env.NODE_ENV === 'production' ? '/api/auth' : 'http://localhost:8080/api/auth';

            const response = await fetch(`${API_URL}/me`, {
                method: 'GET',
                credentials: 'include', // Important for cookies/sessions
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (usernameOrEmail, password) => {
        try {
            setLoading(true);
            const API_URL = process.env.NODE_ENV === 'production' ? '/api/auth' : 'http://localhost:8080/api/auth';

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usernameOrEmail,
                    password,
                }),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const API_URL = process.env.NODE_ENV === 'production' ? '/api/auth' : 'http://localhost:8080/api/auth';

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            const API_URL = process.env.NODE_ENV === 'production' ? '/api/auth' : 'http://localhost:8080/api/auth';

            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Clear local state regardless of response
            setUser(null);
            setIsAuthenticated(false);

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if request failed
            setUser(null);
            setIsAuthenticated(false);
            return { success: true };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            const API_URL = process.env.NODE_ENV === 'production' ? '/api/auth' : 'http://localhost:8080/api/auth';

            const response = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Profile update failed' };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        } finally {
            setLoading(false);
        }
    };

    const checkUsernameAvailability = async (username) => {
        try {
            const API_URL = process.env.NODE_ENV === 'production' ? '/api/auth' : 'http://localhost:8080/api/auth';

            const response = await fetch(`${API_URL}/check-username/${encodeURIComponent(username)}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            return data.available;
        } catch (error) {
            console.error('Username check error:', error);
            return false;
        }
    };

    const checkEmailAvailability = async (email) => {
        try {
            const API_URL = process.env.NODE_ENV === 'production' ? '/api/auth' : 'http://localhost:8080/api/auth';

            const response = await fetch(`${API_URL}/check-email/${encodeURIComponent(email)}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            return data.available;
        } catch (error) {
            console.error('Email check error:', error);
            return false;
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        checkAuthStatus,
        checkUsernameAvailability,
        checkEmailAvailability,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;