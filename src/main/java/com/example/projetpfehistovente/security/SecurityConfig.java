package com.example.projetpfehistovente.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no token needed)
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register").hasRole("ADMIN")
                        // Protected endpoints by role
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/histoventes/**").hasAnyRole("ADMIN", "MANAGER", "DATA_ANALYST", "RESPONSABLE_MAGASIN")
                        .requestMatchers("/api/magasins/**").hasAnyRole("ADMIN", "MANAGER", "RESPONSABLE_MAGASIN")
                        .requestMatchers("/api/articles/**").hasAnyRole("ADMIN", "MANAGER", "DATA_ANALYST")
                        .requestMatchers("/api/analytics/**").hasAnyRole("ADMIN", "MANAGER", "DATA_ANALYST", "RESPONSABLE_MAGASIN")
                        .requestMatchers("/api/analytics/custom/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/store-analytics/**").hasAnyRole("ADMIN", "RESPONSABLE_MAGASIN")
                        // ← ML endpoints
                        .requestMatchers("/api/ml/predict").hasAnyRole("ADMIN", "MANAGER", "DATA_ANALYST")
                        .requestMatchers("/api/ml/status").hasAnyRole("ADMIN", "MANAGER", "DATA_ANALYST")


                        // All other endpoints need authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        return new UrlBasedCorsConfigurationSource() {{
            registerCorsConfiguration("/**", configuration);
        }};
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
