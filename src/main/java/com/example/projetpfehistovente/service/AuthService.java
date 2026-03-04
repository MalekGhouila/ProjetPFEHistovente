package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.dto.AuthResponse;
import com.example.projetpfehistovente.dto.LoginRequest;
import com.example.projetpfehistovente.dto.RegisterRequest;
import com.example.projetpfehistovente.entity.User;
import com.example.projetpfehistovente.repository.UserRepository;
import com.example.projetpfehistovente.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest request){
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found !!"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid password !!");
        }

        String token = jwtUtils.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        return new AuthResponse(token, user.getUsername(),user.getRole());
    }

    public AuthResponse register(RegisterRequest request){
        if(userRepository.existsByUsername(request.getUsername())){
            throw new RuntimeException("UsernameAlready taken !!");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        return new AuthResponse(token, user.getUsername(), user.getRole());
    }
}
