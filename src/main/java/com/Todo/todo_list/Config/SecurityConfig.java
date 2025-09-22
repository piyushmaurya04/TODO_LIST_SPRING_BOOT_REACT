package com.Todo.todo_list.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private SessionAuthenticationFilter sessionAuthenticationFilter;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // Disable CSRF for API endpoints (we're using session-based auth)
                                .csrf(csrf -> csrf.disable())

                                // Configure CORS
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Configure session management
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                                                .maximumSessions(1)
                                                .maxSessionsPreventsLogin(false)
                                                .sessionRegistry(sessionRegistry()))

                                // Configure authorization
                                .authorizeHttpRequests(authz -> authz
                                                // Allow access to static resources
                                                .requestMatchers("/", "/index.html", "/static/**", "/assets/**",
                                                                "/*.js", "/*.css", "/*.ico",
                                                                "/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.svg")
                                                .permitAll()

                                                // Allow access to H2 console (only for development)
                                                .requestMatchers("/h2-console/**").permitAll()

                                                // Allow access to auth endpoints
                                                .requestMatchers("/api/auth/register", "/api/auth/login",
                                                                "/api/auth/logout", "/api/auth/me",
                                                                "/api/auth/check-username/**",
                                                                "/api/auth/check-email/**")
                                                .permitAll()

                                                // Require authentication for all other API endpoints
                                                .requestMatchers("/api/**").authenticated()

                                                // Allow access to all other requests (for SPA routing)
                                                .anyRequest().permitAll())

                                // Configure headers (for H2 console)
                                .headers(headers -> headers
                                                .frameOptions(frame -> frame.sameOrigin()))

                                // Configure logout
                                .logout(logout -> logout
                                                .logoutUrl("/api/auth/logout")
                                                .logoutSuccessUrl("/")
                                                .invalidateHttpSession(true)
                                                .clearAuthentication(true)
                                                .deleteCookies("JSESSIONID"));

                // Register our session authentication filter before
                // UsernamePasswordAuthenticationFilter
                http.addFilterBefore(sessionAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

        @Bean
        public SessionRegistry sessionRegistry() {
                return new SessionRegistryImpl();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Allow specific origins
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://localhost:8080"));

                // Allow all headers
                configuration.setAllowedHeaders(Arrays.asList("*"));

                // Allow specific HTTP methods
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));

                // Allow credentials (cookies, authorization headers)
                configuration.setAllowCredentials(true);

                // Cache preflight response for 1 hour
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }
}