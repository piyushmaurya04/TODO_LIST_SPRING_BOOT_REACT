import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthService from '../Services/AuthService';
import './Signup.css';

const Signup = ({ onSwitchToLogin, onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationStatus, setValidationStatus] = useState({});

    const { register } = useAuth();

    // Animation state
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Real-time validation
        validateField(name, value);
    };

    const validateField = async (fieldName, value) => {
        const newValidationStatus = { ...validationStatus };

        switch (fieldName) {
            case 'username':
                if (value.length >= 3) {
                    const usernameValidation = AuthService.validateUsername(value);
                    if (usernameValidation.valid) {
                        // Check availability
                        try {
                            const isAvailable = await AuthService.checkUsername(value);
                            newValidationStatus.username = isAvailable.available ? 'valid' : 'taken';
                        } catch {
                            newValidationStatus.username = 'error';
                        }
                    } else {
                        newValidationStatus.username = 'invalid';
                    }
                } else {
                    newValidationStatus.username = '';
                }
                break;

            case 'email':
                if (value.length > 0) {
                    if (AuthService.isValidEmail(value)) {
                        // Check availability
                        try {
                            const isAvailable = await AuthService.checkEmail(value);
                            newValidationStatus.email = isAvailable.available ? 'valid' : 'taken';
                        } catch {
                            newValidationStatus.email = 'error';
                        }
                    } else {
                        newValidationStatus.email = 'invalid';
                    }
                } else {
                    newValidationStatus.email = '';
                }
                break;

            case 'password':
                if (value.length > 0) {
                    const passwordValidation = AuthService.validatePassword(value);
                    newValidationStatus.password = passwordValidation.valid ? 'valid' : 'weak';
                } else {
                    newValidationStatus.password = '';
                }
                break;

            case 'confirmPassword':
                if (value.length > 0) {
                    newValidationStatus.confirmPassword = value === formData.password ? 'valid' : 'mismatch';
                } else {
                    newValidationStatus.confirmPassword = '';
                }
                break;

            default:
                break;
        }

        setValidationStatus(newValidationStatus);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else {
            const usernameValidation = AuthService.validateUsername(formData.username);
            if (!usernameValidation.valid) {
                newErrors.username = usernameValidation.message;
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!AuthService.isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            const passwordValidation = AuthService.validatePassword(formData.password);
            if (!passwordValidation.valid) {
                newErrors.password = passwordValidation.message;
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const result = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });

            if (result.success) {
                if (onSignupSuccess) {
                    onSignupSuccess(result.user);
                }
            } else {
                setErrors({ submit: result.message || 'Registration failed' });
            }
        } catch (error) {
            setErrors({ submit: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    const getValidationIcon = (field) => {
        const status = validationStatus[field];
        switch (status) {
            case 'valid':
                return (
                    <div className="validation-icon valid">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4" />
                            <circle cx="12" cy="12" r="9" />
                        </svg>
                    </div>
                );
            case 'invalid':
            case 'weak':
            case 'mismatch':
            case 'taken':
                return (
                    <div className="validation-icon invalid">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const getValidationMessage = (field) => {
        const status = validationStatus[field];
        switch (status) {
            case 'valid':
                return <span className="validation-message success">✓ Available</span>;
            case 'taken':
                return <span className="validation-message error">Already taken</span>;
            case 'invalid':
                return <span className="validation-message error">Invalid format</span>;
            case 'weak':
                return <span className="validation-message warning">Password too weak</span>;
            case 'mismatch':
                return <span className="validation-message error">Passwords don't match</span>;
            default:
                return null;
        }
    };

    return (
        <div className={`signup-container ${isVisible ? 'visible' : ''}`}>
            <div className="signup-card">
                <div className="signup-header">
                    <div className="signup-icon">
                        <div className="icon-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="signup-title">Create Account</h1>
                    <p className="signup-subtitle">Join us to organize your tasks efficiently</p>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName" className="form-label">
                                First Name *
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                                    placeholder="John"
                                    disabled={isLoading}
                                />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                            </div>
                            {errors.firstName && (
                                <span className="error-message">{errors.firstName}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName" className="form-label">
                                Last Name
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Doe"
                                    disabled={isLoading}
                                />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Username *
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className={`form-input ${errors.username ? 'error' : ''} ${validationStatus.username}`}
                                placeholder="johndoe"
                                disabled={isLoading}
                            />
                            <div className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            {getValidationIcon('username')}
                        </div>
                        {errors.username && (
                            <span className="error-message">{errors.username}</span>
                        )}
                        {getValidationMessage('username')}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address *
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`form-input ${errors.email ? 'error' : ''} ${validationStatus.email}`}
                                placeholder="john@example.com"
                                disabled={isLoading}
                            />
                            <div className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            {getValidationIcon('email')}
                        </div>
                        {errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                        {getValidationMessage('email')}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password *
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.password ? 'error' : ''} ${validationStatus.password}`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <circle cx="12" cy="16" r="1" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                                {getValidationIcon('password')}
                            </div>
                            {errors.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                            {getValidationMessage('password')}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password *
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''} ${validationStatus.confirmPassword}`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <circle cx="12" cy="16" r="1" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                                {getValidationIcon('confirmPassword')}
                            </div>
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                            {getValidationMessage('confirmPassword')}
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="error-banner">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {errors.submit}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`signup-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        <span className="btn-text">
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </span>
                        <div className="btn-loader">
                            <div className="spinner"></div>
                        </div>
                        <div className="btn-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                        </div>
                    </button>
                </form>

                <div className="signup-footer">
                    <p>
                        Already have an account?{' '}
                        <button
                            type="button"
                            className="switch-btn"
                            onClick={onSwitchToLogin}
                            disabled={isLoading}
                        >
                            Sign In
                        </button>
                    </p>
                </div>

                {/* Floating particles effect */}
                <div className="floating-particles">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className={`particle particle-${i + 1}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Signup;