package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.dto.UpdateUserRequest;
import com.example.projetpfehistovente.entity.User;
import com.example.projetpfehistovente.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Long id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            if (userRepository.existsByUsernameAndIdNot(req.getUsername(), id)) {
                throw new RuntimeException("Username already taken");
            }
            user.setUsername(req.getUsername());
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            if (userRepository.existsByEmailAndIdNot(req.getEmail(), id)) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(req.getEmail());
        } else {
            // allow clearing email
            user.setEmail(null);
        }

        // Password only updated if provided
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        if (req.getRole() != null) {
            user.setRole(req.getRole());
        }

        user.setIdMagasin(req.getIdMagasin());

        return userRepository.save(user);
    }
}